import { Board } from "../types/board";
import { reconstructPath, manhattanHeuristic } from "../auxFunctions/auxiliar";
import MinHeap from "heap-js";

type pairBoardHeuristic = {
    board: Board,
    heuristic: number
}

// Aceita goalKey para parada e goalMap para cálculo da heurística
export const greedySearch = (board: Board, goalKey: string, goalMap: any) => {
    const startTime = performance.now();
    let visitedCount = 0;

    const heap = new MinHeap<pairBoardHeuristic>((a, b) => a.heuristic - b.heuristic);
    const visited = new Set<string>();
    const parent = new Map<string, string | null>();

    const startKey = board.boardToKey();

    visited.add(startKey);
    
    // Calcula heurística inicial baseada no objetivo dinâmico
    const startH = manhattanHeuristic(board.table, goalMap);
    
    heap.push({ board: board, heuristic: startH });
    parent.set(startKey, null);

    while (heap.length > 0) {
        const node = heap.pop();
        if (!node) break;

        const head = node.board as Board;
        visitedCount++;

        const headKey = head.boardToKey();

        if (headKey === goalKey) {
            const endTime = performance.now();
            return {
                path: reconstructPath(parent, goalKey),
                visitedNodes: visitedCount,
                time: endTime - startTime
            };
        }

        const nextStages = head.getNextStages();

        nextStages.forEach((stage) => {
            const key = stage.boardToKey();
            if (!visited.has(key)) {
                visited.add(key);
                // Calcula heurística do próximo estágio baseada no objetivo dinâmico
                const h = manhattanHeuristic(stage.table, goalMap);
                heap.push({ board: stage, heuristic: h });
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