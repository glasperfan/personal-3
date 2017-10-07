export function splice(str: string, start: number, delCount: number, newSubStr: string): string {
  return str.slice(0, start) + newSubStr + str.slice(start + Math.abs(delCount));
};
