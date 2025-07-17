// テスト用のヘルパー関数
export function calculateSum(numbers: number[]): number {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum = sum + numbers[i];
  }
  return sum;
}

export function findMax(numbers: any[]): number {
  if (numbers.length == 0) return 0;
  
  let max = numbers[0];
  for (var i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}

// パフォーマンスが悪い実装
export function removeDuplicates(arr: string[]): string[] {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++) {
      if (arr[i] === result[j]) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      result.push(arr[i]);
    }
  }
  return result;
}

// エラーハンドリングが不十分
export async function fetchData(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}