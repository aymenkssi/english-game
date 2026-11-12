import { editDistance, evaluateSpeech, normalizeSpeech, numberWords, similarity } from '../lib/speaking';

describe('numberWords', () => {
  it('writes numbers the way they are said', () => {
    expect(numberWords(3)).toBe('three');
    expect(numberWords(13)).toBe('thirteen');
    expect(numberWords(40)).toBe('forty');
    expect(numberWords(21)).toBe('twenty one');
    expect(numberWords(100)).toBe('one hundred');
    expect(numberWords(1989)).toBeNull();
  });
});

describe('normalizeSpeech', () => {
  it('ignores case, punctuation and contractions', () => {
    expect(normalizeSpeech("I'm fine, thank you.")).toEqual(normalizeSpeech('i am fine thank you'));
    expect(normalizeSpeech("I don't like cheese.")).toEqual(['eye', 'do', 'not', 'like', 'cheese']);
    expect(normalizeSpeech("I can't fly.")).toEqual(normalizeSpeech('I cannot fly'));
    expect(normalizeSpeech('What’s your name?')).toEqual(normalizeSpeech('what is your name'));
  });

  it('treats digits and homophones like the expected word', () => {
    expect(normalizeSpeech('3')).toEqual(normalizeSpeech('three'));
    expect(normalizeSpeech('too')).toEqual(normalizeSpeech('two'));
    expect(normalizeSpeech('night')).toEqual(normalizeSpeech('knight'));
    expect(normalizeSpeech('color')).toEqual(normalizeSpeech('colour'));
  });
});

describe('editDistance', () => {
  it('counts insertions, deletions and substitutions', () => {
    expect(editDistance('cat'.split(''), 'cat'.split(''))).toBe(0);
    expect(editDistance('cat'.split(''), 'cap'.split(''))).toBe(1);
    expect(editDistance('kitten'.split(''), 'sitting'.split(''))).toBe(3);
    expect(editDistance([], ['a', 'b'])).toBe(2);
  });
});

describe('similarity', () => {
  it('is 1 for the same words, however they are written', () => {
    expect(similarity('cat', 'Cat')).toBe(1);
    expect(similarity('T-shirt', 'tshirt')).toBe(1);
    expect(similarity('ice cream', 'icecream')).toBe(1);
    expect(similarity("It's three o'clock.", "it is 3 o'clock")).toBe(1);
    expect(similarity('I have got two cats.', 'I have got too cats')).toBe(1);
  });

  it('drops when words are missing or wrong', () => {
    expect(similarity('I like cats.', 'I like')).toBeLessThan(0.8);
    expect(similarity('dog', 'cat')).toBe(0);
    expect(similarity('She has got brown eyes.', 'she has got brown ice')).toBeGreaterThanOrEqual(0.8);
    expect(similarity('cat', '')).toBe(0);
  });
});

describe('evaluateSpeech', () => {
  it('keeps the best alternative', () => {
    expect(evaluateSpeech('sheep', ['ship', 'sheep', 'cheap'])).toEqual({ score: 1, heard: 'sheep', verdict: 'good' });
  });

  it('tells a near miss from a wrong answer', () => {
    expect(evaluateSpeech('My name is Tom.', ['my name is']).verdict).toBe('almost');
    expect(evaluateSpeech('elephant', ['hello']).verdict).toBe('retry');
    expect(evaluateSpeech('elephant', []).verdict).toBe('retry');
  });
});
