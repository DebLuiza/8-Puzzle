import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, 
  Shuffle, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  BrainCircuit, 
  AlertTriangle, 
  List,
  Timer,
  Activity,
  Footprints
} from 'lucide-react';

import './App.css';
import { Board } from "./types/board";
import { bfs } from './functions/bfs';
import { greedySearch } from "./functions/greedySearch";
import { aStar } from "./functions/aStar";
import { 
  manhattanHeuristic, 
  misplacedTilesHeuristic, 
  euclideanHeuristic, 
  isSolvable,
  getGoalPositions 
} from "./auxFunctions/auxiliar";

type SearchResult = {
  path: string[];
  visitedNodes: number;
  time: number;
} | null;

const PRESETS: Record<string, Record<string, string>> = {
  "1 2 3 4 5 6 7 8 0": {
    "Fácil": "1 2 3 4 5 6 7 0 8",   
    "Médio": "1 3 0 4 2 5 7 8 6",   
    "Difícil": "8 6 7 2 5 4 3 0 1", 
  },
  
  "1 2 3 8 0 4 7 6 5": {
    "Fácil": "1 2 3 8 4 0 7 6 5",   
    "Médio": "2 8 3 1 4 0 7 6 5",   
    "Difícil": "5 6 7 4 0 8 3 2 1", 
  }
};

const GOALS = {
  "Clássico (1-8, Vazio no fim)": "1 2 3 4 5 6 7 8 0",
  "Espiral (Vazio no meio)": "1 2 3 8 0 4 7 6 5"
};

function App() {
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [selectedGoal, setSelectedGoal] = useState("1 2 3 4 5 6 7 8 0");

  
  // Estados de controle
  const [isSolving, setIsSolving] = useState(false);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);
  const [stats, setStats] = useState<SearchResult>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [error, setError] = useState("");

  const parseBoardString = (str: string): number[] => {
    if (!str) return [];
    const cleanStr = str.trim();
    if (cleanStr.includes(" ")) {
        return cleanStr.split(/\s+/).map(Number);
    }
    return cleanStr.split('').map(Number);
  };

  const createTable = (arr: number[]): number[][] => {
    const table: number[][] = [];
    for (let i = 0; i < 9; i += 3) table.push(arr.slice(i, i + 3));
    return table;
  }

    const handleGoalChange = (newGoal: string) => {
    setSelectedGoal(newGoal);
    setStats(null);
    setSolutionPath([]);
    
    const currentBoardTable = createTable(tiles);
    const newGoalTable = createTable(parseBoardString(newGoal));

    if (!isSolvable(currentBoardTable, newGoalTable)) {
      setError("Atenção: O tabuleiro atual é impossível de resolver para este objetivo específico! Gere um novo jogo.");
    } else {
      setError(""); 
    }
  };

  const generateRandom = () => {
    stopAnimation();
    setError("");
    
    let newTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }

    const currentGoalArr = parseBoardString(selectedGoal);
    const currentGoalTable = createTable(currentGoalArr);
    const startTable = createTable(newTiles);

    if (!isSolvable(startTable, currentGoalTable)) {
       let idx1 = 0;
       while (newTiles[idx1] === 0) idx1++;
       let idx2 = idx1 + 1;
       while (newTiles[idx2] === 0) idx2++;
       [newTiles[idx1], newTiles[idx2]] = [newTiles[idx2], newTiles[idx1]];
    }

    setTiles(newTiles);
    setStats(null);
    setSolutionPath([]);
  };

  const runAlgorithm = (algoType: string) => {
    stopAnimation();
    setIsSolving(true);
    setError("");

    setTimeout(() => {
      try {
        const boardTable = createTable(tiles);
        const board = new Board(boardTable);
        
        const goalArr = parseBoardString(selectedGoal);
        const goalTable = createTable(goalArr);
        const goalKey = goalArr.join("");
        const goalMap = getGoalPositions(goalTable);

        if (!isSolvable(boardTable, goalTable)) {
            setError("Configuração impossível detectada.");
            setIsSolving(false);
            return;
        }

        let res;
        switch (algoType) {
          case 'BFS': res = bfs(board, goalKey); break;
          case 'GREEDY': res = greedySearch(board, goalKey, goalMap); break;
          case 'ASTAR_MAN': res = aStar(board, manhattanHeuristic, goalKey, goalMap); break;
          case 'ASTAR_MIS': res = aStar(board, misplacedTilesHeuristic, goalKey, goalMap); break;
          case 'ASTAR_EUC': res = aStar(board, euclideanHeuristic, goalKey, goalMap); break;
        }

        if (res && res.path.length > 0) {
          setStats(res as SearchResult);
          setSolutionPath(res.path);
          setPlaybackIndex(0);
          setIsPlaying(true);
        } else {
          setError("O algoritmo não encontrou solução dentro do limite.");
        }
      } catch (e) {
        setError("Erro na execução.");
        console.error(e);
      } finally {
        setIsSolving(false);
      }
    }, 100);
  };

  const loadPreset = (presetStr: string) => {
    stopAnimation();
    setTiles(parseBoardString(presetStr));
    setStats(null);
    setSolutionPath([]);
  };

  useEffect(() => {
    if (solutionPath.length > 0 && solutionPath[playbackIndex]) {
      const currentStepStr = solutionPath[playbackIndex];
      setTiles(parseBoardString(currentStepStr));
    }
  }, [playbackIndex, solutionPath]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && solutionPath.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex((prevIndex) => {
          if (prevIndex >= solutionPath.length - 1) {
            setIsPlaying(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, solutionPath]);

  const stopAnimation = () => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setPlaybackIndex(prev => Math.min(prev + 1, solutionPath.length - 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setPlaybackIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="container">
      <h1 style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
        <Puzzle size={40} strokeWidth={1.5} /> 
        8-Puzzle Solver
      </h1>

      <div className="board-container">
        <div className="grid">
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`tile ${tile === 0 ? 'empty' : ''}`}
              >
                {tile !== 0 && tile}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="controls-section">
         <div style={{marginBottom: 20, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <label style={{
                fontSize: '12px', 
                fontWeight: 'bold', 
                color:'var(--text-secondary)', 
                marginRight: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 5
            }}>
                <List size={14}/> OBJETIVO:
            </label>
            <select 
                value={selectedGoal} 
                onChange={(e) => handleGoalChange(e.target.value)} 
            >
                {Object.entries(GOALS).map(([label, val]) => (
                <option key={val} value={val}>{label}</option>
                ))}
            </select>
         </div>

         <div className="button-group">
            <button onClick={generateRandom}>
                <Shuffle size={18} /> Aleatório
            </button>
            
            {PRESETS[selectedGoal] && Object.entries(PRESETS[selectedGoal]).map(([name, val]) => (
                <button key={name} onClick={() => loadPreset(val)}>
                    {name}
                </button>
            ))}
         </div>
      </div>

      <div className="controls-section">
        <h3>Algoritmos de Busca</h3>
        <div className="button-group">
          <button className="btn-primary" onClick={() => runAlgorithm('BFS')} disabled={isSolving}>BFS</button>
          <button className="btn-primary" onClick={() => runAlgorithm('GREEDY')} disabled={isSolving}>Gulosa</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_MAN')} disabled={isSolving}>A* (Manh)</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_EUC')} disabled={isSolving}>A* (Eucl)</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_MIS')} disabled={isSolving}>A* (Peças)</button>
        </div>
        
        {isSolving && (
            <p style={{
                color: 'var(--accent-color)', 
                fontWeight: 'bold', 
                marginTop: 15, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10
            }}>
                <BrainCircuit className="spin-animation" /> Processando...
            </p>
        )}
      </div>

      {stats && (
        <div className="results-panel controls-section">
          <h3>Resultados</h3>
          <div className="stats-row">
            <div className="stat-item">
               <Timer size={24} color="var(--accent-color)" style={{marginBottom: 5}}/>
               <span>{stats.time.toFixed(0)}</span> <small>ms</small>
            </div>
            <div className="stat-item">
               <Activity size={24} color="var(--accent-color)" style={{marginBottom: 5}}/>
               <span>{stats.visitedNodes}</span> <small>Nós</small>
            </div>
            <div className="stat-item">
               <Footprints size={24} color="var(--accent-color)" style={{marginBottom: 5}}/>
               <span>{stats.path.length - 1}</span> <small>Passos</small>
            </div>
          </div>
          
          <div className="player-controls">
            <button 
              className="btn-action" 
              onClick={() => setIsPlaying(!isPlaying)}
              style={{color: isPlaying ? 'var(--error-color)' : 'var(--success-color)'}}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? " PAUSAR" : " REPRODUZIR SOLUÇÃO"}
            </button>

            <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginTop: 20}}>
              <button onClick={handlePrev} disabled={playbackIndex === 0} style={{padding: '10px 15px'}}>
                <SkipBack size={20} />
              </button>
              
              <div style={{flex: 1, textAlign: 'center'}}>
                <input 
                    type="range" 
                    min="0" 
                    max={solutionPath.length - 1} 
                    value={playbackIndex} 
                    onChange={(e) => {
                        setIsPlaying(false);
                        setPlaybackIndex(Number(e.target.value));
                    }}
                />
                <div className="step-counter">Passo {playbackIndex} / {solutionPath.length - 1}</div>
              </div>

              <button onClick={handleNext} disabled={playbackIndex === solutionPath.length - 1} style={{padding: '10px 15px'}}>
                <SkipForward size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-msg">
            <AlertTriangle size={24} /> 
            {error}
        </div>
      )}
    </div>
  );
}

export default App;