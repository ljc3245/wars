
import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Player, Square, Point, ScorePopup, PieceAnimation } from '../types';

interface BoardProps {
  board: (Player | null)[][];
  gridSize: number;
  onPlacePiece: (x: number, y: number) => void;
  lastSquares: Square[];
  scorePopups: ScorePopup[];
  setScorePopups: React.Dispatch<React.SetStateAction<ScorePopup[]>>;
  isDarkMode: boolean;
}

export interface BoardHandle {
  getSnapshot: () => string;
}

const Board = forwardRef<BoardHandle, BoardProps>(({ board, gridSize, onPlacePiece, lastSquares, scorePopups, setScorePopups, isDarkMode }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pieceAnimations, setPieceAnimations] = useState<PieceAnimation[]>([]);
  const requestRef = useRef<number>(0);

  // 配色方案 - 根据主题动态调整
  const COLORS = {
    RED: '#EF5777',
    BLUE: '#54A0FF',
    DOT: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
    BG: isDarkMode ? '#1e293b' : '#FFFFFF'
  };

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      return canvasRef.current?.toDataURL('image/png', 0.5) || "";
    }
  }));

  useEffect(() => {
    const isEmpty = board.every(row => row.every(cell => cell === null));
    if (isEmpty) {
      setPieceAnimations([]);
    }
  }, [board]);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 30;
    const innerSize = width - padding * 2;
    const cell = innerSize / (gridSize - 1);

    // 清空背景
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, width, height);

    // 1. 绘制交叉点 (圆点替代线条)
    ctx.fillStyle = COLORS.DOT;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        ctx.beginPath();
        // 10x10 网格点稍微大一点更好看
        ctx.arc(padding + i * cell, padding + j * cell, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. 绘制刚达成的正方形 (增强的发光效果)
    if (lastSquares.length > 0) {
      lastSquares.forEach(sq => {
        const color = sq.player === Player.RED ? COLORS.RED : COLORS.BLUE;
        const centerX = sq.points.reduce((s, p) => s + p.x, 0) / 4;
        const centerY = sq.points.reduce((s, p) => s + p.y, 0) / 4;
        const sortedPts = [...sq.points].sort((a, b) => 
          Math.atan2(a.y - centerY, a.x - centerX) - Math.atan2(b.y - centerY, b.x - centerX)
        );

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = isDarkMode ? 4 : 3;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = isDarkMode ? 20 : 15;
        ctx.shadowColor = color;
        ctx.globalAlpha = 0.5 + Math.sin(time / 200) * 0.2;

        ctx.beginPath();
        ctx.moveTo(padding + sortedPts[0].x * cell, padding + sortedPts[0].y * cell);
        for (let i = 1; i < 4; i++) {
          ctx.lineTo(padding + sortedPts[i].x * cell, padding + sortedPts[i].y * cell);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.globalAlpha = isDarkMode ? 0.15 : 0.08;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      });
    }

    // 3. 绘制棋子
    board.forEach((row, x) => {
      row.forEach((player, y) => {
        if (player) {
          const color = player === Player.RED ? COLORS.RED : COLORS.BLUE;
          const px = padding + x * cell;
          const py = padding + y * cell;
          
          let scale = 1;
          const anim = pieceAnimations.find(a => a.x === x && a.y === y);
          if (anim) {
            const elapsed = time - anim.startTime;
            const duration = 400;
            if (elapsed < duration) {
              const t = elapsed / duration;
              scale = t < 0.5 ? (t * 2) * 1.2 : 1.2 - ((t - 0.5) * 2) * 0.2;
            }
          }

          ctx.save();
          ctx.translate(px, py);
          ctx.scale(scale, scale);
          
          ctx.shadowBlur = isDarkMode ? 12 : 8;
          ctx.shadowColor = isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)';
          ctx.shadowOffsetY = isDarkMode ? 4 : 3;
          
          ctx.beginPath();
          ctx.arc(0, 0, cell * 0.38, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(-cell * 0.1, -cell * 0.1, 0, 0, 0, cell * 0.38);
          grad.addColorStop(0, player === Player.RED ? '#FF8E8E' : '#88C0FF');
          grad.addColorStop(1, color);
          ctx.fillStyle = grad;
          ctx.fill();
          
          // 棋子高光
          ctx.beginPath();
          ctx.arc(-cell * 0.1, -cell * 0.1, cell * 0.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fill();

          ctx.restore();
        }
      });
    });

    // 4. 绘制得分弹出
    const updatedPopups = scorePopups.filter(p => time - p.startTime < 1500);
    if (updatedPopups.length !== scorePopups.length) {
      setScorePopups(updatedPopups);
    }

    updatedPopups.forEach(p => {
      const elapsed = time - p.startTime;
      const progress = elapsed / 1500;
      const alpha = 1 - progress;
      const yOffset = progress * 70;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.font = `black ${cell * 0.9}px sans-serif`;
      ctx.textAlign = 'center';
      if (isDarkMode) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
      } else {
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
      }
      ctx.fillText(`+${p.value}`, padding + p.x * cell, padding + p.y * cell - cell - yOffset);
      ctx.restore();
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [board, gridSize, lastSquares, scorePopups, setScorePopups, pieceAnimations, isDarkMode, COLORS]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  useEffect(() => {
    const resize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const size = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.width = size;
        canvasRef.current.height = size;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 30;
    const innerSize = canvas.width - padding * 2;
    const cell = innerSize / (gridSize - 1);

    const gx = Math.round((x - padding) / cell);
    const gy = Math.round((y - padding) / cell);

    if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize && !board[gx][gy]) {
      setPieceAnimations(prev => [...prev, { x: gx, y: gy, startTime: performance.now(), player: Player.RED }]);
      onPlacePiece(gx, gy);
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      onClick={handleClick}
      className="w-full h-full block cursor-pointer"
      style={{ touchAction: 'none' }}
    />
  );
});

export default Board;
