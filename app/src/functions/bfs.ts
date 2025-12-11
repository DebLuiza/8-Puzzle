import { Board } from "../types/board"
import { reconstructPath } from "../auxFunctions/auxiliar";

export const bfs = (board: Board) => {
    const queue: Board[] = []
    const visited = new Set<string>();
    const parent = new Map<string, string | null>();

    visited.add(board.boardToKey());
    queue.push(board);
    parent.set(board.boardToKey(), null);   


    while (queue.length > 0) {
        const head = queue.shift() as Board;
        const headKey = head.boardToKey();

        if (headKey === "123456780") {
            break; 
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

    return reconstructPath(parent);
}