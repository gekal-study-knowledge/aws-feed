/**
 * オブジェクトのキーをキャメルケースに変換する
 * @param obj 変換対象のオブジェクト
 * @returns キーがキャメルケースになった新しいオブジェクト
 */
export function keysToCamelCase(
  obj: Record<string, unknown>,
): Record<string, string | number | null | undefined> {
  const newObj: Record<string, string | number | null | undefined> = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
    const value = obj[key];
    newObj[camelKey] =
      typeof value === 'string' || typeof value === 'number' || value === null
        ? value
        : String(value);
  });
  return newObj;
}
