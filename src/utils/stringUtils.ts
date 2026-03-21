/**
 * オブジェクトのキーをキャメルケースに変換する
 * @param obj 変換対象のオブジェクト
 * @returns キーがキャメルケースになった新しいオブジェクト
 */
export function keysToCamelCase(obj: Record<string, any>): Record<string, any> {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/([-_][a-z])/gi, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
    newObj[camelKey] = obj[key];
  });
  return newObj;
}
