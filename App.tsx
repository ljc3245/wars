
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Point, Square, GameState, ScorePopup, SaveSlot } from './types';
import Board, { BoardHandle } from './components/Board';
import Controls from './components/Controls';
import Toast from './components/Toast';
import LoadModal from './components/LoadModal';

const GRID_SIZE = 10;
const TARGET_SCORE = 100;
const AUTO_SAVE_KEY = 'squareWars_auto_save';
const SAVES_LIST_KEY = 'squareWars_slots';
const THEME_KEY = 'squareWars_theme';

const App: React.FC = () => {
  const boardRef = useRef<BoardHandle>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
    currentPlayer: Player.RED,
    scores: { [Player.RED]: 0, [Player.BLUE]: 0 },
    history: [],
    foundSquares: [],
    isGameOver: false,
    winner: null,
    lastChance: false,
    lastSquaresFound: []
  });

  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'info' }>({
    message: '',
    visible: false,
    type: 'success'
  });

  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);

  // 1. 启动初始化
  useEffect(() => {
    // 恢复主题
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    const autoSaved = localStorage.getItem(AUTO_SAVE_KEY);
    if (autoSaved) {
      try {
        const parsed = JSON.parse(autoSaved);
        // 简单校验存档网格大小是否匹配，防止崩溃
        if (parsed.board && parsed.board.length === GRID_SIZE && parsed.history && parsed.history.length > 0) {
          setGameState(parsed);
          showToast('已自动恢复进度', 'info');
        }
      } catch (e) { console.error("恢复自动存档失败", e); }
    }
    
    const slots = localStorage.getItem(SAVES_LIST_KEY);
    if (slots) setSaveSlots(JSON.parse(slots));
  }, []);

  // 2. 自动保存逻辑
  useEffect(() => {
    if (gameState.history.length > 0 && !gameState.isGameOver) {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  // 3. 主题切换副作用
  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    } else {
      document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
  };

  const checkSquares = (newPoint: Point, player: Player, currentBoard: (Player | null)[][]): Square[] => {
    const squares: Square[] = [];
    const foundKeys = new Set<string>();

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (currentBoard[x][y] === player && (x !== newPoint.x || y !== newPoint.y)) {
          const B = { x, y };
          const A = newPoint;
          const dx = B.x - A.x;
          const dy = B.y - A.y;

          const checkAndAdd = (C: Point, D: Point) => {
            if (
              C.x >= 0 && C.x < GRID_SIZE && C.y >= 0 && C.y < GRID_SIZE &&
              D.x >= 0 && D.x < GRID_SIZE && D.y >= 0 && D.y < GRID_SIZE &&
              currentBoard[C.x][C.y] === player &&
              currentBoard[D.x][D.y] === player
            ) {
              const pts: Point[] = [A, B, C, D].sort((p1, p2) => p1.x - p2.x || p1.y - p2.y);
              const key = pts.map(p => `(${p.x},${p.y})`).join('|');
              if (!foundKeys.has(key)) {
                foundKeys.add(key);
                const score = dx * dx + dy * dy;
                squares.push({ points: [A, B, C, D], score, player });
              }
            }
          };

          checkAndAdd({ x: B.x - dy, y: B.y + dx }, { x: A.x - dy, y: A.y + dx });
          checkAndAdd({ x: B.x + dy, y: B.y - dx }, { x: A.x + dy, y: A.y - dx });

          if ((A.x + B.x + A.y - B.y) % 2 === 0 && (A.y + B.y + B.x - A.x) % 2 === 0) {
             const cx = (A.x + B.x + A.y - B.y) / 2;
             const cy = (A.y + B.y + B.x - A.x) / 2;
             const dx2 = (A.x + B.x - A.y + B.y) / 2;
             const dy2 = (A.y + B.y - B.x + A.x) / 2;
             checkAndAdd({ x: cx, y: cy }, { x: dx2, y: dy2 });
          }
        }
      }
    }
    return squares;
  };

  const handlePlacePiece = (x: number, y: number) => {
    if (gameState.isGameOver || gameState.board[x][y] !== null) return;

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[x][y] = gameState.currentPlayer;

    const newSquares = checkSquares({ x, y }, gameState.currentPlayer, newBoard);
    const addedScore = newSquares.reduce((sum, sq) => sum + sq.score, 0);

    if (addedScore > 0) {
      setScorePopups(prev => [...prev, {
        id: Date.now(),
        x, y, value: addedScore,
        startTime: performance.now(),
        color: gameState.currentPlayer === Player.RED ? '#EF5777' : '#54A0FF'
      }]);
      showToast(`成功占领！+${addedScore}分`);
    }

    const newScores = {
      ...gameState.scores,
      [gameState.currentPlayer]: gameState.scores[gameState.currentPlayer] + addedScore
    };

    const nextPlayer = gameState.currentPlayer === Player.RED ? Player.BLUE : Player.RED;
    let isGameOver = false;
    let winner = null;
    let lastChance = gameState.lastChance;

    if (newScores[gameState.currentPlayer] >= TARGET_SCORE && !lastChance) {
      lastChance = true;
    } else if (lastChance) {
      isGameOver = true;
      if (newScores[Player.RED] > newScores[Player.BLUE]) winner = Player.RED;
      else if (newScores[Player.BLUE] > newScores[Player.RED]) winner = Player.BLUE;
      else winner = null;
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      scores: newScores,
      currentPlayer: nextPlayer,
      foundSquares: [...prev.foundSquares, ...newSquares],
      lastSquaresFound: newSquares,
      history: [...prev.history, {
        point: { x, y },
        player: prev.currentPlayer,
        boardState: prev.board.map(r => [...r]),
        scores: { ...prev.scores }
      }],
      lastChance,
      isGameOver,
      winner
    }));
  };

  const handleUndo = () => {
    if (gameState.history.length === 0 || gameState.isGameOver) return;
    const last = gameState.history[gameState.history.length - 1];
    setGameState(prev => ({
      ...prev,
      board: last.boardState,
      currentPlayer: last.player,
      scores: last.scores,
      history: prev.history.slice(0, -1),
      foundSquares: prev.foundSquares.filter(sq => !sq.points.some(p => p.x === last.point.x && p.y === last.point.y)),
      lastSquaresFound: [],
      lastChance: false,
      isGameOver: false,
      winner: null
    }));
  };

  const handleReset = () => {
    const emptyBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    setGameState({
      board: emptyBoard,
      currentPlayer: Player.RED,
      scores: { [Player.RED]: 0, [Player.BLUE]: 0 },
      history: [],
      foundSquares: [],
      isGameOver: false,
      winner: null,
      lastChance: false,
      lastSquaresFound: []
    });
    setScorePopups([]);
    localStorage.removeItem(AUTO_SAVE_KEY);
    showToast('棋盘已清空');
  };

  const handleSaveSnapshot = () => {
    const thumbnail = boardRef.current?.getSnapshot() || "";
    const newSlot: SaveSlot = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      thumbnail,
      data: JSON.parse(JSON.stringify(gameState))
    };
    const updated = [newSlot, ...saveSlots].slice(0, 10);
    setSaveSlots(updated);
    localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(updated));
    showToast(`快照已保存 ${new Date().toLocaleTimeString()}`);
  };

  const loadFromSlot = (slot: SaveSlot) => {
    // 检查快照的网格大小是否匹配
    if (slot.data.board.length !== GRID_SIZE) {
      showToast('无法载入：存档网格大小不兼容', 'info');
      return;
    }
    setGameState(slot.data);
    setScorePopups([]);
    setIsLoadModalOpen(false);
    showToast('快照加载成功');
  };

  const deleteSlot = (id: string) => {
    const updated = saveSlots.filter(s => s.id !== id);
    setSaveSlots(updated);
    localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      <Toast message={toast.message} visible={toast.visible} type={toast.type} isDarkMode={isDarkMode} />
      
      <LoadModal 
        isOpen={isLoadModalOpen} 
        onClose={() => setIsLoadModalOpen(false)} 
        slots={saveSlots} 
        onLoad={loadFromSlot} 
        onDelete={deleteSlot}
        isDarkMode={isDarkMode}
      />

      <div className={`w-full max-w-2xl backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-10 flex flex-col gap-6 border transition-all duration-500 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-white/50'
      }`}>
        
        {/* Top Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-[-1rem]">
          <h1 className={`text-xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            SquareWars
          </h1>
          <button 
            onClick={toggleTheme}
            className={`p-3 rounded-2xl transition-all active:scale-90 shadow-sm border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-slate-100 text-slate-400'
            }`}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Modern Score Board */}
        <div className={`grid grid-cols-3 items-center rounded-3xl p-6 border shadow-inner transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <div className={`flex flex-col items-center transition-all duration-500 ${gameState.currentPlayer === Player.RED ? 'scale-110 opacity-100 translate-y-[-4px]' : 'scale-95 opacity-40'}`}>
            <div className="w-3 h-3 rounded-full bg-[#EF5777] mb-2 shadow-[0_0_12px_#EF5777]"></div>
            <span className="text-[#EF5777] font-bold text-[10px] uppercase tracking-[0.2em]">RED</span>
            <span className="text-5xl font-black text-[#EF5777] tracking-tighter">{gameState.scores[Player.RED]}</span>
          </div>
          
          <div className="flex flex-col items-center">
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold mb-2 border shadow-sm transition-colors ${
               isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-400 border-gray-100'
             }`}>GOAL {TARGET_SCORE}</div>
             <div className={`w-px h-12 bg-gradient-to-b from-transparent ${isDarkMode ? 'via-slate-700' : 'via-gray-200'} to-transparent`}></div>
          </div>

          <div className={`flex flex-col items-center transition-all duration-500 ${gameState.currentPlayer === Player.BLUE ? 'scale-110 opacity-100 translate-y-[-4px]' : 'scale-95 opacity-40'}`}>
            <div className="w-3 h-3 rounded-full bg-[#54A0FF] mb-2 shadow-[0_0_12px_#54A0FF]"></div>
            <span className="text-[#54A0FF] font-bold text-[10px] uppercase tracking-[0.2em]">BLUE</span>
            <span className="text-5xl font-black text-[#54A0FF] tracking-tighter">{gameState.scores[Player.BLUE]}</span>
          </div>
        </div>

        {/* Dynamic Status Bar */}
        <div className={`text-center py-3 px-8 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 shadow-sm ${
          gameState.isGameOver ? 'bg-slate-100 text-slate-900' : 
          gameState.lastChance ? 'bg-orange-500 text-white animate-pulse' :
          gameState.currentPlayer === Player.RED ? 'bg-[#EF5777]/10 text-[#EF5777]' : 'bg-[#54A0FF]/10 text-[#54A0FF]'
        }`}>
          {gameState.isGameOver ? (
            `GAME OVER • ${gameState.winner ? (gameState.winner === Player.RED ? 'RED' : 'BLUE') + ' WINS!' : 'DRAW'}`
          ) : (
            gameState.lastChance ? "LAST CHANCE!" : `TURN: ${gameState.currentPlayer === Player.RED ? 'RED' : 'BLUE'}`
          )}
        </div>

        {/* Board Container */}
        <div className={`relative aspect-square w-full max-w-[480px] mx-auto rounded-[2rem] shadow-xl overflow-hidden p-2 border transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <Board 
            ref={boardRef}
            board={gameState.board} 
            gridSize={GRID_SIZE} 
            onPlacePiece={handlePlacePiece} 
            lastSquares={gameState.lastSquaresFound}
            scorePopups={scorePopups}
            setScorePopups={setScorePopups}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Menu Bar */}
        <Controls 
          onUndo={handleUndo} 
          onSave={handleSaveSnapshot} 
          onLoad={() => setIsLoadModalOpen(true)} 
          onReset={handleReset} 
          isDarkMode={isDarkMode}
        />
      </div>

      <p className={`mt-10 text-[10px] uppercase tracking-[0.3em] font-medium transition-colors ${isDarkMode ? 'text-slate-500' : 'text-gray-400/80'}`}>
        SquareWars v2.8 • Grid Size Updated
      </p>
    </div>
  );
};

export default App;
