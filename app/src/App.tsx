import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Board } from "./types/board";
import { bfs } from "./functions/bfs";
import { useEffect } from "react";
import { greedySearch } from "./functions/greedySearch";

function App() {
  const [count, setCount] = useState(0);
  const [board, setBoard] = useState(new Board([[8, 6, 7], [2, 5, 4], [3, 0, 1]]));
  const [result, setResult] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    const result = greedySearch(board);
    setResult(result);
    console.log("Greedy Search Result:", result);
  }, [board]);

  if (!result) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <p>Carregando solução com BFS...</p>
      </div>
    );
  }

 
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
