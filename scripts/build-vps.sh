#!/usr/bin/env bash
# Compile Hello English! sur un serveur Linux (VPS Ubuntu / Debian), sans EAS.
#
#   ./scripts/build-vps.sh setup   # une seule fois : JDK, Node, yarn, SDK Android (sudo pour les paquets système)
#   ./scripts/build-vps.sh apk     # APK à installer sur un téléphone
#   ./scripts/build-vps.sh aab     # .aab à envoyer sur Google Play
#   ./scripts/build-vps.sh all     # les deux
#
# Les fichiers produits vont dans ~/builds/hello-english/.
# La clé de signature est créée au premier build dans ~/.hello-english/ : À SAUVEGARDER, elle sert pour toutes les mises à jour.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
KEYS_DIR="${KEYS_DIR:-$HOME/.hello-english}"
OUT_DIR="${OUT_DIR:-$HOME/builds/hello-english}"
# Téléphones réels uniquement (pas les émulateurs x86) : build plus rapide, APK deux fois plus léger.
ABIS="${ABIS:-arm64-v8a,armeabi-v7a}"

# Versions demandées par React Native 0.86 (node_modules/react-native/gradle/libs.versions.toml).
CMDLINE_TOOLS_ZIP="commandlinetools-linux-13114758_latest.zip"
SDK_PACKAGES=("platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" "cmake;3.22.1")

say() { printf '\n\033[1;33m▶ %s\033[0m\n' "$*"; }
die() { printf '\033[1;31m✖ %s\033[0m\n' "$*" >&2; exit 1; }
as_root() { if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi; }

setup() {
  command -v apt-get >/dev/null || die "Ce script installe les paquets avec apt (Ubuntu / Debian)."

  say "Paquets système (JDK 17, git, unzip)"
  as_root apt-get update -y
  as_root apt-get install -y openjdk-17-jdk-headless git unzip curl ca-certificates

  if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
    say "Node.js 22"
    curl -fsSL https://deb.nodesource.com/setup_22.x | as_root bash -
    as_root apt-get install -y nodejs
  fi
  command -v yarn >/dev/null || { say "yarn"; as_root npm install -g yarn@1.22.22; }

  if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
    say "Outils en ligne de commande Android"
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    tmp="$(mktemp -d)"
    curl -fsSL -o "$tmp/tools.zip" "https://dl.google.com/android/repository/$CMDLINE_TOOLS_ZIP"
    unzip -q "$tmp/tools.zip" -d "$tmp"
    mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  fi

  say "SDK Android (plateforme 36, build-tools, NDK, CMake) : environ 3 Go"
  yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null || true
  "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "${SDK_PACKAGES[@]}" >/dev/null

  # Gradle a besoin d'environ 4 Go de mémoire (RAM + swap).
  mem_kb="$(awk '/MemTotal|SwapTotal/ { s += $2 } END { print s }' /proc/meminfo)"
  if [ "$mem_kb" -lt 3800000 ]; then
    printf '\033[1;31m⚠ Seulement %s Mo de mémoire (RAM + swap). Ajoutez du swap avant de compiler, par exemple :\033[0m\n' "$((mem_kb / 1024))"
    echo "    sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
  fi
  say "Installation terminée. Lancez : ./scripts/build-vps.sh apk"
}

# Crée la clé de signature au premier build ; les mots de passe restent sur le serveur, jamais dans le dépôt.
signing() {
  mkdir -p "$KEYS_DIR" && chmod 700 "$KEYS_DIR"
  if [ ! -f "$KEYS_DIR/signing.env" ]; then
    say "Création de la clé de signature dans $KEYS_DIR"
    pass="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)"
    keytool -genkeypair -v -storetype JKS -keystore "$KEYS_DIR/hello-english.jks" -alias hello-english \
      -keyalg RSA -keysize 2048 -validity 10000 -storepass "$pass" -keypass "$pass" \
      -dname "CN=Hello English, O=Aymen, C=FR" >/dev/null 2>&1
    printf 'STORE_PASSWORD=%s\nKEY_ALIAS=hello-english\nKEY_PASSWORD=%s\n' "$pass" "$pass" > "$KEYS_DIR/signing.env"
    chmod 600 "$KEYS_DIR/signing.env" "$KEYS_DIR/hello-english.jks"
    printf '\033[1;31m⚠ Sauvegardez %s (les deux fichiers) : sans cette clé, plus de mise à jour possible.\033[0m\n' "$KEYS_DIR"
  fi
  # shellcheck disable=SC1091
  . "$KEYS_DIR/signing.env"
  SIGNING=(
    "-Pandroid.injected.signing.store.file=$KEYS_DIR/hello-english.jks"
    "-Pandroid.injected.signing.store.password=$STORE_PASSWORD"
    "-Pandroid.injected.signing.key.alias=$KEY_ALIAS"
    "-Pandroid.injected.signing.key.password=$KEY_PASSWORD"
  )
}

build() {
  [ -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ] || die "SDK Android introuvable dans $ANDROID_HOME. Lancez d'abord : ./scripts/build-vps.sh setup"
  cd "$ROOT"
  version="$(node -p "require('./app.json').expo.version")"
  code="$(node -p "require('./app.json').expo.android.versionCode")"
  name="hello-english-$version-$code"

  say "Dépendances"
  yarn install --frozen-lockfile
  say "Projet Android natif (expo prebuild)"
  npx expo prebuild --platform android --no-install --clean
  signing
  mkdir -p "$OUT_DIR"

  cd "$ROOT/android"
  for target in "$@"; do
    if [ "$target" = apk ]; then
      say "Compilation de l'APK"
      ./gradlew assembleRelease --no-daemon "-PreactNativeArchitectures=$ABIS" "${SIGNING[@]}"
      cp app/build/outputs/apk/release/app-release.apk "$OUT_DIR/$name.apk"
      say "APK : $OUT_DIR/$name.apk"
    else
      say "Compilation du .aab pour Google Play"
      ./gradlew bundleRelease --no-daemon "-PreactNativeArchitectures=$ABIS" "${SIGNING[@]}"
      cp app/build/outputs/bundle/release/app-release.aab "$OUT_DIR/$name.aab"
      say ".aab : $OUT_DIR/$name.aab"
    fi
  done
}

case "${1:-}" in
  setup) setup ;;
  apk) build apk ;;
  aab) build aab ;;
  all) build apk aab ;;
  *) sed -n '2,11p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
