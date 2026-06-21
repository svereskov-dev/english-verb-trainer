export function isCorrect(userInput: string, expected: string | string[]): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const input = normalize(userInput);
  const answers = Array.isArray(expected) ? expected : [expected];
  
  const allAnswers = answers.flatMap(a => a.split("/").map(normalize));
  return allAnswers.includes(input);
}
