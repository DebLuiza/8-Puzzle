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