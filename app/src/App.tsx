import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const PRESETS = {
  "Fácil": "1 2 3 4 5 6 7 0 8",
  "Médio": "1 3 0 4 2 5 7 8 6",
  "Difícil": "8 6 7 2 5 4 3 0 1",
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

  // --- PARSERS ---
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

  // --- GERAÇÃO ALEATÓRIA MATEMATICAMENTE GARANTIDA ---
  const generateRandom = () => {
    stopAnimation();
    setError(""); // Limpa erros anteriores
    
    // 1. Gera uma permutação aleatória plana
    let newTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Fisher-Yates Shuffle
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }

    // 2. Verifica a paridade contra o Objetivo atual
    const currentGoalArr = parseBoardString(selectedGoal);
    const currentGoalTable = createTable(currentGoalArr);
    const startTable = createTable(newTiles);

    // 3. Correção de Paridade (Swap Fix)
    // Se a paridade não bater, trocamos duas peças quaisquer (que não sejam o zero)
    // Isso garante matematicamente que o tabuleiro se torne solúvel.
    if (!isSolvable(startTable, currentGoalTable)) {
       // Encontra dois índices válidos para trocar (evitando o 0)
       let idx1 = 0;
       while (newTiles[idx1] === 0) idx1++;
       
       let idx2 = idx1 + 1;
       while (newTiles[idx2] === 0) idx2++;

       // Realiza a troca para corrigir a paridade
       [newTiles[idx1], newTiles[idx2]] = [newTiles[idx2], newTiles[idx1]];
    }

    setTiles(newTiles);
    setStats(null);
    setSolutionPath([]);
  };

  // --- EXECUÇÃO DOS ALGORITMOS ---
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

        // Validação final de segurança
        if (!isSolvable(boardTable, goalTable)) {
            setError("⚠️ Atenção: Configuração impossível detectada. Use o botão 'Aleatório' para corrigir.");
            setIsSolving(false);
            return;
        }

        let res;

        switch (algoType) {
          case 'BFS': 
             res = bfs(board, goalKey); 
             break;
          case 'GREEDY': 
             res = greedySearch(board, goalKey, goalMap); 
             break;
          case 'ASTAR_MAN': 
             res = aStar(board, manhattanHeuristic, goalKey, goalMap); 
             break;
          case 'ASTAR_MIS': 
             res = aStar(board, misplacedTilesHeuristic, goalKey, goalMap); 
             break;
          case 'ASTAR_EUC': 
             res = aStar(board, euclideanHeuristic, goalKey, goalMap); 
             break;
        }

        if (res && res.path.length > 0) {
          setStats(res as SearchResult);
          setSolutionPath(res.path);
          setPlaybackIndex(0);
          setIsPlaying(true); // Inicia animação automaticamente
        } else {
          setError("⚠️ O algoritmo atingiu o limite de segurança (100k+ nós) sem achar o final.");
        }
      } catch (e) {
        setError("Erro na execução.");
        console.error(e);
      } finally {
        setIsSolving(false);
      }
    }, 100);
  };

  // --- OUTRAS FUNÇÕES ---
  const loadPreset = (presetStr: string) => {
    stopAnimation();
    setTiles(parseBoardString(presetStr));
    setStats(null);
    setSolutionPath([]);
  };

  // Player Sync
  useEffect(() => {
    if (solutionPath.length > 0 && solutionPath[playbackIndex]) {
      const currentStepStr = solutionPath[playbackIndex];
      setTiles(parseBoardString(currentStepStr));
    }
  }, [playbackIndex, solutionPath]);

  // Player Loop
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
      <h1>🧩 8-Puzzle Solver</h1>

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
                {tile !== 0 && <span>{tile}</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="controls-section">
         <div style={{marginBottom: 10}}>
            <label style={{fontSize: '12px', fontWeight: 'bold', color:'#555'}}>OBJETIVO FINAL:</label>
            <select 
                value={selectedGoal} 
                onChange={(e) => {
                    setSelectedGoal(e.target.value);
                    setStats(null); 
                    setSolutionPath([]);
                    // Não gera novo tabuleiro automaticamente para não confundir o usuário,
                    // mas o botão resolver vai validar antes de rodar.
                }}
                style={{marginLeft: 10, padding: 5, borderRadius: 4}}
            >
                {Object.entries(GOALS).map(([label, val]) => (
                <option key={val} value={val}>{label}</option>
                ))}
            </select>
         </div>

         <div className="button-group">
            <button className="btn-secondary" onClick={generateRandom}>🎲 Gerar Aleatório (Sempre Válido)</button>
            {Object.entries(PRESETS).map(([name, val]) => (
                <button key={name} className="btn-secondary" onClick={() => loadPreset(val)}>
                {name}
                </button>
            ))}
         </div>
      </div>

      <div className="controls-section" style={{borderTop: '1px solid #eee', paddingTop: 15}}>
        <h3>Resolver com:</h3>
        <div className="button-group">
          <button className="btn-primary" onClick={() => runAlgorithm('BFS')} disabled={isSolving}>BFS</button>
          <button className="btn-primary" onClick={() => runAlgorithm('GREEDY')} disabled={isSolving}>Gulosa</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_MAN')} disabled={isSolving}>A* (Manh)</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_EUC')} disabled={isSolving}>A* (Eucl)</button>
          <button className="btn-primary" onClick={() => runAlgorithm('ASTAR_MIS')} disabled={isSolving}>A* (Peças)</button>
        </div>
        {isSolving && <p style={{color: '#e67e22', fontWeight: 'bold', marginTop: 10}}>🧠 Pensando... (Aguarde)</p>}
      </div>

      {stats && (
        <div className="results-panel">
          <div className="stats-row">
            <div className="stat-item">
               <span>{stats.time.toFixed(2)}ms</span> <small>Tempo</small>
            </div>
            <div className="stat-item">
               <span>{stats.visitedNodes}</span> <small>Nós</small>
            </div>
            <div className="stat-item">
               <span>{stats.path.length - 1}</span> <small>Passos</small>
            </div>
          </div>
          
          <div className="player-controls">
            <button 
              className="btn-action" 
              onClick={() => setIsPlaying(!isPlaying)}
              style={{backgroundColor: isPlaying ? '#e74c3c' : '#27ae60', marginBottom: 15}}
            >
              {isPlaying ? "⏸️ PAUSAR ANIMAÇÃO" : "▶️ CONTINUAR AUTOMÁTICO"}
            </button>

            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <button className="btn-secondary" onClick={handlePrev} disabled={playbackIndex === 0}>
                 ⏪
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
                    style={{width: '100%'}}
                />
                <div className="step-counter">Passo {playbackIndex} / {solutionPath.length - 1}</div>
              </div>

              <button className="btn-secondary" onClick={handleNext} disabled={playbackIndex === solutionPath.length - 1}>
                 ⏩
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

export default App;