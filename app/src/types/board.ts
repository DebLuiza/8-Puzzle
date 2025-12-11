import { canMove, getZeroPosition, applyDirection, cloneTable, swap } from "../auxFunctions/auxiliar";

const directions = [
  { row: -1, col: 0 }, //cima
  { row: 1, col: 0 }, //baixo
  { row: 0, col: -1 }, //esquerda
  { row: 0, col: 1 }, //direita
];

export class Board {
  table: number[][];

  constructor(table: number[][]) {
    this.table = table;
  }

  getNextStages(): Board[] {
    const nextStages: Board[] = [];
    const position = getZeroPosition(this.table);

    directions.forEach((direction) => {
      const target = applyDirection(position, direction);

      if (!canMove(this.table, target)) {
        return;
      }

      const newTable = cloneTable(this.table); 
      swap(newTable, position, target);

      nextStages.push(new Board(newTable)); 
    });

    return nextStages
  }
  
}
