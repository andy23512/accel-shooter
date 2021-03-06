const KEEP_LOWERCASE_WORD_LIST = [
  'and',
  'as',
  'but',
  'for',
  'if',
  'nor',
  'or',
  'so',
  'yet',
  'a',
  'an',
  'the',
  'at',
  'by',
  'for',
  'in',
  'of',
  'off',
  'on',
  'per',
  'to',
  'up',
  'via',
];

function firstLetterCapitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function titleCase(str: string): string {
  const sentence = str.toLowerCase().split(' ');
  const resultSentence = sentence.map((w, i) => {
    if (i === 0) {
      return firstLetterCapitalize(w);
    }
    if (KEEP_LOWERCASE_WORD_LIST.includes(w)) {
      return w;
    }
    return firstLetterCapitalize(w);
  });
  return resultSentence.join(' ');
}
