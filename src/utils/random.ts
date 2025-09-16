export const randomInt = (min: number, max: number): number => {
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
