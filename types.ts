
export enum Player {
  RED = 'RED',
  BLUE = 'BLUE'
}

export interface Point {
  x: number;
  y: number;
}

export interface Square {
  points: [Point, Point, Point, Point];
  score: number;
  player: Player;
}

export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  value: number;
  startTime: number;
  color: string;
}

export interface PieceAnimation {
  x: number;
  y: number;
  startTime: number;
  player: Player;
}

export interface GameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  scores: { [key in Player]: number };
  history: GameHistoryItem[];
  foundSquares: Square[];
  isGameOver: boolean;
  winner: Player | null;
  lastChance: boolean;
  lastSquaresFound: Square[];
}

export interface GameHistoryItem {
  point: Point;
  player: Player;
  boardState: (Player | null)[][];
  scores: { [key in Player]: number };
}

export interface SaveSlot {
  id: string;
  timestamp: string;
  thumbnail: string;
  data: GameState;
}
