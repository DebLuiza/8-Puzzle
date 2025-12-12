type Position = {
  row: number;
  col: number;
};

type Direction = Position;

export function applyDirection(position: Position, direction: Direction): Position {
  return {
    row: position.row + direction.row,
    col: position.col + direction.col,
  };
}

export function cloneTable(table: number[][]): number[][] {
  return table.map(row => [...row]);
}

export function swap(table: number[][], a: Position, b: Position): void {
  [table[a.row][a.col], table[b.row][b.col]] = [
    table[b.row][b.col],
    table[a.row][a.col],
  ];
}

export function canMove(table: number[][], position: Position) {
  return (
    position.row >= 0 &&
    position.row < table.length &&
    position.col >= 0 &&
    position.col < table[0].length
  );
}

export function getZeroPosition(table: number[][]) {
  const rowIndex = table.findIndex((linha) => linha.includes(0));
  const colIndex = rowIndex !== -1 ? table[rowIndex].indexOf(0) : -1;

  return { row: rowIndex, col: colIndex };
}

export function reconstructPath(parent: Map<string, string | null>, endKey: string) {
  const path: string[] = [];
  let currentKey: string | null = endKey; 

  while (currentKey !== null) {
    path.push(currentKey);
    currentKey = parent.get(currentKey) || null;
  }
  return path.reverse();
}

function countInversions(flattenedBoard: number[]): number {
  let inversions = 0;
  for (let i = 0; i < flattenedBoard.length; i++) {
    for (let j = i + 1; j < flattenedBoard.length; j++) {
      if (flattenedBoard[i] !== 0 && flattenedBoard[j] !== 0 && flattenedBoard[i] > flattenedBoard[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

export function isSolvable(startTable: number[][], goalTable: number[][]): boolean {
  const startFlat = startTable.flat();
  const goalFlat = goalTable.flat();

  const startInversions = countInversions(startFlat);
  const goalInversions = countInversions(goalFlat);

  return (startInversions % 2) === (goalInversions % 2);
}

export function getGoalPositions(goalTable: number[][]): Map<number, {r: number, c: number}> {
  const map = new Map();
  for(let i=0; i<3; i++){
    for(let j=0; j<3; j++){
      map.set(goalTable[i][j], {r: i, c: j});
    }
  }
  return map;
}

// --- HEURÍSTICAS ---

export function manhattanHeuristic(table: number[][], goalMap: Map<number, {r: number, c: number}>): number {
  let distance = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const value = table[i][j];
      if (value !== 0) {
        const target = goalMap.get(value);
        if (target) {
          distance += Math.abs(i - target.r) + Math.abs(j - target.c);
        }
      }
    }
  }
  return distance;
}

export function euclideanHeuristic(table: number[][], goalMap: Map<number, {r: number, c: number}>): number {
  let distance = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const value = table[i][j];
      if (value !== 0) {
        const target = goalMap.get(value);
        if (target) {
          distance += Math.sqrt(Math.pow(i - target.r, 2) + Math.pow(j - target.c, 2));
        }
      }
    }
  }
  return distance;
}

export function misplacedTilesHeuristic(table: number[][], _goalMap: any, goalKey: string): number {
  let misplaced = 0;
  const currentStr = table.flat().join(""); 
  
  for (let i = 0; i < currentStr.length; i++) {
    const val = currentStr[i];
    if (val !== '0' && val !== goalKey[i]) {
      misplaced++;
    }
  }
  return misplaced;
}