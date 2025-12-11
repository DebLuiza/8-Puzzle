import { Board } from "../types/board";
import { reconstructPath, manhattanHeuristic } from "../auxFunctions/auxiliar";
import MinHeap from "heap-js";

type tuple = {
  board: Board;
  moves: number;      
  heuristic: number;  
};

export const aStar = (board: Board) => {
  const heap = new MinHeap<tuple>(
    (a: tuple, b: tuple) => (a.moves + a.heuristic) - (b.moves + b.heuristic) 
  );
  const visited = new Set<string>();                     
  const parent = new Map<string, string | null>();       
  const gScore = new Map<string, number>();              // melhor g conhecido por estado

  const startKey = board.boardToKey();
  const startH = manhattanHeuristic(board.table);

  heap.push({ board, heuristic: startH, moves: 0 });
  parent.set(startKey, null);
  gScore.set(startKey, 0);

  const goalKey = "123456780";

  while (heap.length > 0) {
    const node = heap.pop();
    if (!node) break;

    const head = node.board as Board;
    const headMoves = node.moves;
    const headKey = head.boardToKey();

    if (visited.has(headKey)) {
      continue;
    }
    visited.add(headKey);

    if (headKey === goalKey) {
      return reconstructPath(parent);
    }

    const nextStages = head.getNextStages();

    nextStages.forEach((stage) => {
      const key = stage.boardToKey();

      // se já foi fechado, ignora
      if (visited.has(key)) {
        return;
      }

      const tentativeG = headMoves + 1;
      const bestKnownG = gScore.get(key);

      if (bestKnownG === undefined || tentativeG < bestKnownG) {
        gScore.set(key, tentativeG);
        parent.set(key, headKey);

        heap.push({
          board: stage,
          heuristic: manhattanHeuristic(stage.table),
          moves: tentativeG,
        });
      }
    });
  }

  return reconstructPath(parent);
};
