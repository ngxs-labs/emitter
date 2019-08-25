export const is = {
  null: (value: any): value is null => value === null,
  undefined: (value: any): value is undefined =>
    typeof value === 'undefined' || value === undefined,
  nullOrUndefined: (value: any): value is null | undefined => value == null,
  truthy: (value: any): value is true => !!value,
  falsy: (value: any): value is false => !value,
  string: (value: any): value is string => typeof value === 'string',
  number: (value: any): value is number => typeof value === 'number',
  boolean: (value: any): value is boolean => typeof value === 'boolean',
  array: <T>(value: any): value is T[] => Array.isArray(value)
};

export function flatten<T>(array: T | T[]): T[] {
  if (is.array(array)) {
    return array;
  }

  return [array];
}

export function isNotAFunction(value: any): boolean {
  return typeof value !== 'function';
}
