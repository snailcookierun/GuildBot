/*
Copyright [2023] [snailcookierun]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
const reverseObject = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
     if(newObj[obj[key]]){
        newObj[obj[key]].push(key);
     }else{
        newObj[obj[key]] = [key];
     }
  });
  return newObj;
};