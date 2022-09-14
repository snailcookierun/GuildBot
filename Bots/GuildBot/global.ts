/* Global functions */
function isNumber(n: string): boolean { return !isNaN(Number(n)) };
function isUnsigned(n: string): boolean { return isNumber(n) && Number(n) >= 0 };
function isNatural(n: string): boolean { return isNumber(n) && Number(n) > 0 };
function isDuplicateExist(arr: Array<any>): boolean { return new Set(arr).size !== arr.length };
function removeItemOnceIfExist<T>(arr: Array<T>, value: T) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
function moveItemToFront<T>(arr: Array<T>, value: T) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
    arr.unshift(value);
  }
  return arr;
}
function unionArray<T>(x: Array<T>, y: Array<T>) {
  var result: Array<T> = [];
  var concatArr = x.concat(y);
  for (const e of concatArr) {
    if (!result.includes(e))
      result.push(e);
  }
  return result;
}
function average(arr: Array<number>) { if (arr.length > 0) { return Math.round(arr.reduce((p, c) => p + c, 0) / arr.length); } else { return 0; } }
const bossTypeMap = (fn: Function) => (Object.keys(BOSS_TYPE) as (keyof typeof BOSS_TYPE)[]).map(
  (key, index) => { return fn(BOSS_TYPE[key]); }
)