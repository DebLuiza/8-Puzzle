// src/App.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css'; // <--- Importando o CSS separado
import { Board } from "./types/board";
import { bfs } from './functions/bfs';
import { greedySearch } from "./functions/greedySearch";
import { aStar } from "./functions/aStar";
import { 
  manhattanHeuristic, 
  misplacedTilesHeuristic, 
  euclideanHeuristic, 
  isSolvable 
} from "./auxFunctions/auxiliar";

// --- TIPOS ---
type SearchResult = {
  path: string[];
  visitedNodes: number;
  time: number;
} | null;

// --- PRE-SETS ---
const PRESETS = {
  "Fácil": "1 2 3 4 5 6 7 0 8",
  "Médio": "1 3 0 4 2 5 7 8 6",
  "Difícil": "8 6 7 2 5 4 3 0 1",
  "Extremo": "8 0 6 5 4 7 2 3 1"
};

function App() {
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [isSolving, setIsSolving] = useState(false);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);
  const [stats, setStats] = useState<SearchResult>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [error, setError] = useState("");

  const parseBoardString = (str: string): number[] => {
    if (str.includes(" ")) {
        return str.trim().split(/\s+/).map(Number);
    }
    return str.split('').map(Number);
  };

  const generateRandom = () => {
    stopAnimation();
    let newTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let valid = false;

    while (!valid) {
      for (let i = newTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
      }
      
      const table: number[][] = [];
      for (let i = 0; i < 9; i += 3) table.push(newTiles.slice(i, i + 3));
      
      if (isSolvable(table)) valid = true;
    }
    
    setTiles(newTiles);
    setStats(null);
    setSolutionPath([]);
  };

  const loadPreset = (presetStr: string) => {
    stopAnimation();
    setTiles(parseBoardString(presetStr));
    setStats(null);
    setSolutionPath([]);
  };

  const runAlgorithm = (algoType: string) => {
    stopAnimation();
    setIsSolving(true);
    setError("");

    setTimeout(() => {
      try {
        const table: number[][] = [];
        for (let i = 0; i < 9; i += 3) table.push(tiles.slice(i, i + 3));
        const board = new Board(table);

        let res;
        switch (algoType) {
          case 'BFS': res = bfs(board); break;
          case 'GREEDY': res = greedySearch(board); break;
          case 'ASTAR_MAN': res = aStar(board, manhattanHeuristic); break;
          case 'ASTAR_MIS': res = aStar(board, misplacedTilesHeuristic); break;
          case 'ASTAR_EUC': res = aStar(board, euclideanHeuristic); break;
        }

        if (res) {
          setStats(res as SearchResult);
          setSolutionPath(res.path);
          setPlaybackIndex(0);
        }
      } catch (e) {
        setError("Erro ao executar algoritmo.");
        console.error(e);
      } finally {
        setIsSolving(false);
      }
    }, 100);
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && solutionPath.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= solutionPath.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextStep = solutionPath[prev + 1];
          setTiles(parseBoardString(nextStep));
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, solutionPath]);

  const stopAnimation = () => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  };

  return (
    <div className="container">
      <h1>🧩 8-Puzzle Solver</h1>

      {/* ÁREA DO TABULEIRO */}
      <div className="board-container">
        <div className="grid">
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`tile ${tile === 0 ? 'empty' : ''}`}
              >
                {tile !== 0 && <span>{tile}</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* CONFIGURAÇÃO */}
      <div className="controls-section">
        <h3>1. Configurar Tabuleiro</h3>
        <div className="button-group">
          <button className="btn-secondary" onClick={generateRandom}>🎲 Aleatório</button>
          {Object.entries(PRESETS).map(([name, val]) => (
            <button key={name} className="btn-secondary" onClick={() => loadPreset(val)}>
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* RESOLVER */}
      <div className="controls-section">
        <h3>2. Escolher Algoritmo</h3>
        <div className="button-group">
          <button className="btn-primary" onClick={() => runAlgorithm('BFS')} disabled={isSolving}>BFS</button>
          <button className="btn-primary" onClick={() => runAlgorithm('GREEDY')} disabled={isSolving}>Gulosa</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_MAN')} disabled={isSolving}>A* (Manhattan)</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_EUC')} disabled={isSolving}>A* (Euclidiana)</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_MIS')} disabled={isSolving}>A* (Peças Fora)</button>
        </div>
        {isSolving && <p style={{marginTop: 10, color: '#2ecc71'}}>Calculando solução...</p>}
      </div>

      {/* RESULTADOS */}
      {stats && (
        <div className="results-panel">
          <div className="stats-row">
            <div className="stat-item">
              <span>{stats.time.toFixed(2)}ms</span>
              <span>Tempo</span>
            </div>
            <div className="stat-item">
              <span>{stats.visitedNodes}</span>
              <span>Nós Visitados</span>
            </div>
            <div className="stat-item">
              <span>{stats.path.length - 1}</span>
              <span>Movimentos</span>
            </div>
          </div>
          
          <div className="player-controls">
            <button 
              className="btn-action" 
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "⏸️ Pausar Animação" : "▶️ Reproduzir Solução"}
            </button>
            
            <input 
              type="range" 
              min="0" 
              max={solutionPath.length - 1} 
              value={playbackIndex} 
              onChange={(e) => {
                const idx = Number(e.target.value);
                setPlaybackIndex(idx);
                setTiles(parseBoardString(solutionPath[idx]));
                setIsPlaying(false);
              }}
            />
            <div className="step-counter">
              Passo {playbackIndex} de {solutionPath.length - 1}
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

export default App;