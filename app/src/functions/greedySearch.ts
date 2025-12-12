import { Board } from "../types/board";
import { reconstructPath, manhattanHeuristic } from "../auxFunctions/auxiliar";
import MinHeap from "heap-js";

type pairBoardHeuristic = {
    board: Board,
    heuristic: number
}

export const greedySearch = (board: Board) => {
    const startTime = performance.now();
    let visitedCount = 0;

    const heap = new MinHeap<pairBoardHeuristic>((a: pairBoardHeuristic, b: pairBoardHeuristic) => a.heuristic - b.heuristic);
    
    const visited = new Set<string>();
    const parent = new Map<string, string | null>();

    const startKey = board.boardToKey();

    visited.add(startKey);
    heap.push({ board: board, heuristic: manhattanHeuristic(board.table) });
    parent.set(startKey, null);

    while (heap.length > 0) {
        const node = heap.pop();
        if (!node) break;

        const head = node.board as Board;
        visitedCount++; 

        const headKey = head.boardToKey();

        if (headKey === "123456780") {
            const endTime = performance.now();
            return {
                path: reconstructPath(parent),
                visitedNodes: visitedCount,
                time: endTime - startTime
            };
        }

        const nextStages = head.getNextStages();

        nextStages.forEach((stage) => {
            const key = stage.boardToKey();
            if (!visited.has(key)) {
                visited.add(key);
                heap.push({ board: stage, heuristic: manhattanHeuristic(stage.table) });
                parent.set(key, headKey);
            }
        });
    }

    return {
        path: [],
        visitedNodes: visitedCount,
        time: performance.now() - startTime
    };
}