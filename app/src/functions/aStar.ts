import { Board } from "../types/board";
import { reconstructPath } from "../auxFunctions/auxiliar";
import MinHeap from "heap-js";

export type SearchResult = {
  path: string[];
  visitedNodes: number;
  time: number;
};

export const aStar = (
    board: Board, 
    heuristicFunc: (t: number[][], map: any, key: string) => number,
    goalKey: string,
    goalMap: any
): SearchResult => {
  const startTime = performance.now();
  const MAX_NODES = 200000; // 🛑 LIMITE MAIOR PARA A*
  
  const heap = new MinHeap<{ board: Board; moves: number; heuristic: number }>(
    (a, b) => (a.moves + a.heuristic) - (b.moves + b.heuristic)
  );
  
  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const gScore = new Map<string, number>();

  const startKey = board.boardToKey();
  const startH = heuristicFunc(board.table, goalMap, goalKey);

  heap.push({ board, heuristic: startH, moves: 0 });
  parent.set(startKey, null);
  gScore.set(startKey, 0);

  let visitedCount = 0;

  while (heap.length > 0) {
    if (visitedCount > MAX_NODES) break; // Aborta se demorar demais

    const node = heap.pop();
    if (!node) break;
    const head = node.board;
    const headKey = head.boardToKey();

    if (visited.has(headKey)) continue;
    
    visited.add(headKey);
    visitedCount++;

    if (headKey === goalKey) {
        const endTime = performance.now();
        return {
            path: reconstructPath(parent, goalKey),
            visitedNodes: visitedCount,
            time: endTime - startTime
        };
    }

    const nextStages = head.getNextStages();
    const tentativeG = node.moves + 1;

    nextStages.forEach((stage) => {
      const key = stage.boardToKey();
      const currentBestG = gScore.get(key);

      if (currentBestG === undefined || tentativeG < currentBestG) {
        gScore.set(key, tentativeG);
        parent.set(key, headKey);
        heap.push({
          board: stage,
          heuristic: heuristicFunc(stage.table, goalMap, goalKey),
          moves: tentativeG,
        });
      }
    });
  }
  
  return { path: [], visitedNodes: visitedCount, time: performance.now() - startTime };
};