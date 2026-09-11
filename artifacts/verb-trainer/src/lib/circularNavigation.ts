export function wrapIndex(index: number, length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("wrapIndex requires a positive integer length");
  }

  return ((index % length) + length) % length;
}