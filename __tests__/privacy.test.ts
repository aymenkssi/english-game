import fs from 'fs';
import path from 'path';
import privacy from '../constants/privacy.json';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { render } = require('../play-store/scripts/build-privacy.js');

describe('privacy policy', () => {
  it('has the same sections in French and English', () => {
    expect(privacy.fr.sections).toHaveLength(privacy.en.sections.length);
  });

  it('mentions the microphone, the local progress and the donation link', () => {
    const text = JSON.stringify(privacy.fr);
    expect(text).toMatch(/micro/);
    expect(text).toMatch(/appareil/);
    expect(text).toMatch(/PayPal/);
  });

  it('is published online with the same text as in the app', () => {
    const files: Record<string, string> = render();
    for (const [name, html] of Object.entries(files)) {
      expect(fs.readFileSync(path.join(__dirname, '..', 'docs', name), 'utf8')).toBe(html);
    }
  });
});
