export function flatten<T>(flattenable: T | T[]): T[] {
  return Array.isArray(flattenable) ? flattenable : [flattenable];
}
