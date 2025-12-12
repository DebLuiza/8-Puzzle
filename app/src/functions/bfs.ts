import { Board } from "../types/board";
import { reconstructPath } from "../auxFunctions/auxiliar";

export const bfs = (board: Board) => {
    const startTime = performance.now(); 
    let visitedCount = 0; 

    const queue: Board[] = [];
    const visited = new Set<string>();
    const parent = new Map<string, string | null>();

    const startKey = board.boardToKey();
    
    visited.add(startKey);
    queue.push(board);
    parent.set(startKey, null);   

    while (queue.length > 0) {
        const head = queue.shift() as Board;
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
                queue.push(stage);
                parent.set(key, headKey);
            }
        });
    }

    return {
        path: [],
        visitedNodes: visitedCount,
        time: performance.now() - startTime
    };
};