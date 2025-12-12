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

export function isSolvable(table: number[][]): boolean {
  const flatBoard = table.flat().filter((x) => x !== 0);
  let inversions = 0;

  for (let i = 0; i < flatBoard.length; i++) {
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[i] > flatBoard[j]) {
        inversions++;
      }
    }
  }
  return inversions % 2 === 0;
}

export function reconstructPath(parent: Map<string, string | null>) {
  const path: string[] = [];
  let currentKey: string | null = "123456780";

  while (currentKey !== null) {
    path.push(currentKey);
    currentKey = parent.get(currentKey) || null;
  }
  return path.reverse();
}

export function manhattanHeuristic(table: number[][]): number {
  let distance = 0;

  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const value = table[i][j];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        distance += Math.abs(i - targetRow) + Math.abs(j - targetCol);
      }
      
    }
  }

  return distance;

}

export function misplacedTilesHeuristic(table: number[][]): number {
  let misplaced = 0;
  let expected = 1;
  
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const val = table[i][j];
      if (val !== 0 && val !== expected) { 
        misplaced++;
      }
      expected++;
      if (expected === 9) expected = 0; 
    }
  }
  return misplaced;
}

export function euclideanHeuristic(table: number[][]): number {
  let distance = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const value = table[i][j];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        distance += Math.sqrt(Math.pow(i - targetRow, 2) + Math.pow(j - targetCol, 2));
      }
    }
  }
  return distance;
}