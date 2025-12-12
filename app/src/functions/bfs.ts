import { Board } from "../types/board";
import { reconstructPath } from "../auxFunctions/auxiliar";

export const bfs = (board: Board, goalKey: string) => {
    const startTime = performance.now();
    let visitedCount = 0;
    const MAX_NODES = 100000; 

    const queue: Board[] = [];
    const visited = new Set<string>();
    const parent = new Map<string, string | null>();

    const startKey = board.boardToKey();

    visited.add(startKey);
    queue.push(board);
    parent.set(startKey, null);   

    while (queue.length > 0) {
        if (visitedCount > MAX_NODES) {
            return { path: [], visitedNodes: visitedCount, time: performance.now() - startTime };
        }

        const head = queue.shift() as Board;
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
}