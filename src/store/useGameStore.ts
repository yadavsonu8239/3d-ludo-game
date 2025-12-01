import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SAFE_INDICES, START_INDICES } from '../utils/BoardCoordinates';
import { soundManager } from '../utils/SoundManager';

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Token {
  id: string;
  color: PlayerColor;
  position: number; // -1 = Base, 0-50 = Global Path, 51-56 = Home Path (56 = Goal)
  isSafe: boolean;
}

export interface GameState {
  currentTurn: PlayerColor;
  diceValue: number | null;
  isRolling: boolean;
  tokens: { [key: string]: Token };
  consecutiveSixes: number;
  playerNames: { [key in PlayerColor]: string };
  winner: PlayerColor | null;
  lastCapture: { attackerId: string, defenderId: string, timestamp: number } | null;
  
  // Actions
  rollDice: () => void;
  setDiceValue: (value: number) => void;
  moveToken: (tokenId: string) => void;
  nextTurn: () => void;
  setPlayerNames: (names: { [key in PlayerColor]: string }) => void;

  // Game Flow
  gameStatus: 'MENU' | 'PLAYING' | 'FINISHED';
  selectedEnvironment: string;
  playerCount: 2 | 4;
  setPlayerCount: (count: 2 | 4) => void;
  startGame: (environment: string) => void;
  resetGame: () => void;

  // Settings
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    graphicsQuality: 'low' | 'high';
  };
  updateSettings: (settings: Partial<GameState['settings']>) => void;
}

const INITIAL_TOKENS: { [key: string]: Token } = {};
['red', 'blue', 'green', 'yellow'].forEach((color) => {
  for (let i = 0; i < 4; i++) {
    const id = `${color}-${i}`;
    INITIAL_TOKENS[id] = {
      id,
      color: color as PlayerColor,
      position: -1,
      isSafe: true,
    };
  }
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentTurn: 'red',
      diceValue: null,
      isRolling: false,
      tokens: INITIAL_TOKENS,
      consecutiveSixes: 0,
      playerNames: {
        red: 'Player 1',
        blue: 'Player 2',
        green: 'Player 3',
        yellow: 'Player 4'
      },
      winner: null,
      lastCapture: null,
      
      settings: {
        masterVolume: 0.5,
        musicVolume: 0.5,
        sfxVolume: 1.0,
        graphicsQuality: 'high'
      },

      updateSettings: (newSettings) => {
        set((state) => ({
            settings: { ...state.settings, ...newSettings }
        }));
        // Update SoundManager immediately
        const { masterVolume, musicVolume, sfxVolume } = get().settings;
        soundManager.setVolume(masterVolume, musicVolume, sfxVolume);
        soundManager.toggleSound(masterVolume > 0);
      },

      rollDice: () => {
        if (get().isRolling || get().diceValue !== null || get().winner) return;
        set({ isRolling: true, diceValue: null });
        // Logic is now handled in setDiceValue, triggered by Dice.tsx after physics
      },

      setDiceValue: (value) => {
        const { consecutiveSixes } = get();
        
        // Handle Three 6s Rule
        let newConsecutiveSixes = consecutiveSixes;
        if (value === 6) {
            newConsecutiveSixes++;
        } else {
            newConsecutiveSixes = 0;
        }

        if (newConsecutiveSixes === 3) {
            // Penalty: Turn forfeited immediately
            set({ diceValue: value, isRolling: false, consecutiveSixes: 0 });
            setTimeout(() => {
                get().nextTurn();
            }, 1000);
            return;
        }

        set({ diceValue: value, isRolling: false, consecutiveSixes: newConsecutiveSixes });

        // Auto-skip if no moves possible
        const { tokens, currentTurn } = get();
        const playerTokens = Object.values(tokens).filter(t => t.color === currentTurn);
        let canMove = false;

        for (const token of playerTokens) {
            if (token.position === -1) {
                if (value === 6) canMove = true;
            } else if (token.position < 56) { // Not finished
                // Exact Roll Check: Must land EXACTLY on 56
                if (token.position + value <= 56) {
                    canMove = true;
                }
            }
        }

        if (!canMove) {
            setTimeout(() => {
                get().nextTurn();
            }, 1000);
        }
      },

      moveToken: (tokenId) => {
        const { diceValue, currentTurn, tokens } = get();
        if (!diceValue || tokens[tokenId].color !== currentTurn) return;

        const token = tokens[tokenId];
        let newPosition = token.position;
        let moveSuccessful = false;

        // 1. Move from Base
        if (token.position === -1) {
            if (diceValue === 6) {
                newPosition = 0; // Move to Start
                moveSuccessful = true;
            }
        } else {
            // 2. Move along path
            // Exact Roll Check
            if (token.position + diceValue <= 56) {
                newPosition = token.position + diceValue;
                moveSuccessful = true;
            }
        }

        if (!moveSuccessful) return;

        let capturedOpponent = false;
        let updatedTokens = { ...tokens };
        
        // Calculate Global Index for Collision Detection
        // Only if on Global Path (0-50)
        let newGlobalIndex = -1;
        if (newPosition >= 0 && newPosition <= 50) {
            const startIndex = START_INDICES[currentTurn];
            newGlobalIndex = (startIndex + newPosition) % 52;
        }

        // Check Capture
        if (newGlobalIndex !== -1 && !SAFE_INDICES.includes(newGlobalIndex)) {
            Object.values(updatedTokens).forEach(t => {
                if (t.color !== currentTurn && t.position >= 0 && t.position <= 50) {
                    const tStartIndex = START_INDICES[t.color];
                    const tGlobalIndex = (tStartIndex + t.position) % 52;
                    
                    if (tGlobalIndex === newGlobalIndex) {
                        // Capture!
                        updatedTokens[t.id] = { ...t, position: -1 }; // Send to Base
                        capturedOpponent = true;
                        set({ lastCapture: { attackerId: tokenId, defenderId: t.id, timestamp: Date.now() } });
                        if (import.meta.env.DEV) console.log(`Captured ${t.id}!`);
                        soundManager.play('CAPTURE');
                    }
                }
            });
        }

        // Update Token
        updatedTokens[tokenId] = {
            ...updatedTokens[tokenId],
            position: newPosition
        };

        // Play move sound if not capturing (capture sound takes precedence)
        if (!capturedOpponent) {
            if (newPosition === 56) {
                soundManager.play('WIN'); // Reached goal
            } else if (SAFE_INDICES.includes(newGlobalIndex)) {
                soundManager.play('SAFE_SPOT');
            } else if (newPosition > 50) {
                soundManager.play('HOME_ENTRY');
            } else {
                // soundManager.play('MOVE'); // Handled in Character.tsx for step-by-step sound
            }
        }

        // Check Win (All 4 tokens at 56)
        const playerTokens = Object.values(updatedTokens).filter(t => t.color === currentTurn);
        const hasWon = playerTokens.every(t => t.position === 56);

        if (hasWon) {
            if (import.meta.env.DEV) console.log(`${currentTurn} WINS!`);
            soundManager.play('WIN');
            set({ tokens: updatedTokens, diceValue: null, winner: currentTurn, gameStatus: 'FINISHED' });
            return;
        }

        set({ tokens: updatedTokens, diceValue: null });

        // Turn Logic
        // Extra roll if: 6 rolled (and < 3 times), Captured, or Reached Goal (56)
        const reachedGoal = newPosition === 56;
        const earnedExtraRoll = (diceValue === 6) || capturedOpponent || reachedGoal;

        if (!earnedExtraRoll && !hasWon) {
            get().nextTurn();
        }
      },

      nextTurn: () => {
        const { currentTurn, playerCount } = get();
        // My coordinates are CCW: Yellow -> Red -> Green -> Blue.
        const turnOrder: PlayerColor[] = ['yellow', 'red', 'green', 'blue'];
        
        let nextIndex = turnOrder.indexOf(currentTurn);
        
        do {
            nextIndex = (nextIndex + 1) % 4;
        } while (playerCount === 2 && (turnOrder[nextIndex] === 'blue' || turnOrder[nextIndex] === 'green'));
        // For 2 players, we skip Blue and Green. So Yellow <-> Red.

        set({ currentTurn: turnOrder[nextIndex], diceValue: null, consecutiveSixes: 0 });
        soundManager.play('TURN_SWITCH');
      },

      setPlayerNames: (names) => set({ playerNames: names }),

      gameStatus: 'MENU',
      selectedEnvironment: 'park',
      playerCount: 2,

      setPlayerCount: (count) => set({ playerCount: count }),

      startGame: (environment) => {
        set({ gameStatus: 'PLAYING', selectedEnvironment: environment });
      },

      resetGame: () => {
        set({ 
          gameStatus: 'MENU', 
          currentTurn: 'red', 
          diceValue: null, 
          tokens: INITIAL_TOKENS,
          playerCount: 2,
          consecutiveSixes: 0,
          winner: null,
          playerNames: {
            red: 'Player 1',
            blue: 'Player 2',
            green: 'Player 3',
            yellow: 'Player 4'
          }
        });
      },
    }),
    {
      name: 'ludo-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        // Only persist these fields
        currentTurn: state.currentTurn,
        tokens: state.tokens,
        playerNames: state.playerNames,
        gameStatus: state.gameStatus,
        selectedEnvironment: state.selectedEnvironment,
        playerCount: state.playerCount,
        winner: state.winner,
        settings: state.settings
      }),
    }
  )
);
