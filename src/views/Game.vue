<template>
  <div class="game-container">
    <div class="dash-header">
      <h1>2048</h1>
      <div class="game-stats">
        <div class="tokens">
          <span class="token-count">$ASH: {{ playerTokens }}</span>
        </div>
        <div class="games-left" :class="{ 'warning': gamesRemaining === 0 }">
          <span class="material-icons">timer</span>
          <span>Games Left: {{ gamesRemaining }}/1</span>
        </div>
      </div>
    </div>
    
    <div class="game-intro">
      <p class="game-description">Merge tiles to reach the 2048 tile in this addictive puzzle game!</p>
      <button class="play-btn" @click="playGame" :disabled="!canPlayGame">
        {{ playButtonText }}
      </button>
    </div>

    <!-- Leaderboard Section -->
    <div class="leaderboard">
      <h2>Leaderboard</h2>
      <div class="leaderboard-table">
        <div class="leaderboard-header">
          <div class="rank-col">Rank</div>
          <div class="player-col">Player</div>
          <div class="score-col">Score</div>
          <div class="tokens-col">$ASH</div>
        </div>
        <div v-for="(player, index) in leaderboard" :key="index" class="leaderboard-row">
          <div class="rank-col">{{ index + 1 }}</div>
          <div class="player-col">{{ player.name }}</div>
          <div class="score-col">{{ player.score }}</div>
          <div class="tokens-col">{{ player.tokens }}</div>
        </div>
      </div>
    </div>

    <!-- 2048 Game Modal -->
    <div v-if="showGame2048" class="game-modal">
      <div class="game-modal-content">
        <div class="game-modal-header">
          <div class="header-left">
            <h2>2048</h2>
            <div class="score-panel">
              <div class="score-container">
                <div class="score-label">$ASH</div>
                <div class="score-value">{{ score }}</div>
              </div>
              <div class="score-container">
                <div class="score-label">Best</div>
                <div class="score-value">{{ highScore }}</div>
              </div>
              <div class="score-container">
                <div class="score-label">$ASH</div>
                <div class="score-value">{{ playerTokens }}</div>
              </div>
            </div>
          </div>
          <button class="close-btn" @click="closeGame">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="game-content">
          <div class="game-board">
            <div 
              v-for="(row, rowIndex) in board" 
              :key="'row-' + rowIndex" 
              class="board-row"
            >
              <div 
                v-for="(cell, colIndex) in row" 
                :key="'cell-' + rowIndex + '-' + colIndex" 
                class="board-cell"
                :class="[cell === 0 ? 'cell-empty' : 'cell-' + cell]"
              >
                <div class="cell-inner">{{ cell !== 0 ? cell : '' }}</div>
              </div>
            </div>
            <div v-if="gameOver || gameWon" class="game-overlay">
              <div :class="gameOver ? 'game-over-message' : 'game-won-message'">
                <span class="material-icons">{{ gameOver ? 'sentiment_very_dissatisfied' : 'emoji_events' }}</span>
                {{ gameOver ? 'Game Over!' : 'You Win!' }}
              </div>
            </div>
          </div>
          <div class="game-controls">
            <div class="game-guide">
              <div class="guide-item">
                <span class="material-icons">keyboard_arrow_up</span>
                <span class="material-icons">keyboard_arrow_down</span>
                <span class="material-icons">keyboard_arrow_left</span>
                <span class="material-icons">keyboard_arrow_right</span>
                <span>Move tiles</span>
              </div>
              <div class="guide-item">
                <span class="material-icons">stars</span>
                <span>+1 token per 1,000 points</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFirestore, collection, query, orderBy, limit, getDocs, setDoc, doc, getDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { getAuth } from 'firebase/auth';

export default {
  name: 'GameComponent',
  props: {
    initialGameBalance: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // 2048 Game state
      showGame2048: false,
      SIZE: 4,
      board: [],
      score: 0,
      highScore: 0,
      gameOver: false,
      gameWon: false,
      touchStartX: 0,
      touchStartY: 0,
      // Game limit system (per user, from Firestore)
      gamesRemaining: 3,
      lastGameReset: null,
      nextReset: null,
      countdown: '',
      countdownTimer: null,
      // Player and token system
      userName: '',
      playerTokens: 0,
      // Track tokens earned in current game
      lastScoreForTokens: 0,
      // Leaderboard
      leaderboard: [],
    };
  },
  computed: {
    canPlayGame() {
      return this.gamesRemaining > 0;
    },
    playButtonText() {
      if (this.gamesRemaining === 0 && this.nextReset) {
        return `Next reset in ${this.countdown}`;
      }
      return 'Play Now';
    }
  },
  methods: {
    async initializeGameState() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        this.userName = userData.name || userData.fullName || ((userData.firstName && userData.lastName) ? `${userData.firstName} ${userData.lastName}` : user.email);
      } else {
        // Fallback to email if user document not found
        this.userName = user.email || 'Guest';
      }

      // Fetch player tokens, name, and high score from Firestore
      await this.fetchPlayerTokens();
      // Fetch play limit from Firestore
      await this.fetchPlayLimit();
    },
    async fetchPlayLimit() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const playsRef = doc(collection(db, 'game_2048_plays'), user.uid);
      const docSnap = await getDoc(playsRef);
      const now = Timestamp.now();
      
      if (!docSnap.exists()) {
        console.log('No existing play limit found. Creating new record.');
        // First time: create record
        const nextReset = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000);
        await setDoc(playsRef, {
          gamesRemaining: 1, // Set to 1 for daily limit
          lastReset: now,
          nextReset: Timestamp.fromDate(nextReset)
        });
        this.gamesRemaining = 1;
        this.lastGameReset = now.toDate();
        this.nextReset = nextReset; // Use the correct nextReset
        console.log('New play limit record created. gamesRemaining:', this.gamesRemaining);

      } else {
        const data = docSnap.data();
        const lastReset = data.lastReset.toDate();
        const nextReset = data.nextReset ? data.nextReset.toDate() : new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        const nowDate = new Date();
        
        if (nowDate >= nextReset) {
          console.log('Reset time has passed. Resetting play limit.');
          // Reset
          const newNextReset = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000);
          await setDoc(playsRef, {
            gamesRemaining: 1, // Reset to 1 for daily limit
            lastReset: Timestamp.fromDate(nowDate),
            nextReset: Timestamp.fromDate(newNextReset)
          });
          this.gamesRemaining = 1;
          this.lastGameReset = nowDate;
          this.nextReset = newNextReset;
          console.log('Play limit reset. gamesRemaining:', this.gamesRemaining);

        } else {
          console.log('Within play period. Using remaining games.');
          this.gamesRemaining = data.gamesRemaining;
          this.lastGameReset = lastReset;
          this.nextReset = nextReset;
          console.log('Using fetched gamesRemaining:', this.gamesRemaining);
        }
      }
      this.startCountdown();
    },
    async decrementPlay() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore(app);
      const playsRef = doc(collection(db, 'game_2048_plays'), user.uid);

      // Fetch the latest data before decrementing
      const docSnap = await getDoc(playsRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        let gamesRemaining = data.gamesRemaining > 0 ? data.gamesRemaining - 1 : 0;

        console.log('Decrementing play count. Old:', data.gamesRemaining, 'New:', gamesRemaining);

        await setDoc(playsRef, {
          gamesRemaining,
          lastReset: data.lastReset,
          nextReset: data.nextReset
        });

        this.gamesRemaining = gamesRemaining;
        console.log('Play count decremented and saved. local gamesRemaining:', this.gamesRemaining);

        // After decrementing, re-fetch the play limit to ensure local state is in sync
        // This might be redundant but helps confirm the issue isn't here
      } else {
        console.error('Attempted to decrement play count but play limit document not found.');
        // If the document is unexpectedly missing, try re-initializing
        await this.fetchPlayLimit();
      }
    },
    startCountdown() {
      if (this.countdownTimer) clearInterval(this.countdownTimer);
      this.updateCountdown();
      this.countdownTimer = setInterval(this.updateCountdown, 1000);
    },
    updateCountdown() {
      if (!this.nextReset) {
        this.countdown = '';
        return;
      }
      const now = new Date();
      let diff = this.nextReset - now;
      if (diff < 0) diff = 0;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.countdown = `${hours}h ${minutes}m ${seconds}s`;
    },
    async playGame() {
      if (!this.canPlayGame) {
        return;
      }
      // Decrement play count in Firestore BEFORE starting the game
      await this.decrementPlay();
      this.showGame2048 = true;
      this.startNewGame();
      this.$nextTick(() => {
        window.addEventListener('keydown', this.handleKeyDown);
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
          gameBoard.addEventListener('touchstart', this.handleTouchStart);
          gameBoard.addEventListener('touchend', this.handleTouchEnd);
        }
      });
    },
    closeGame() {
      this.showGame2048 = false;
      const gameBoard = document.querySelector('.game-board');
      if (gameBoard) {
        gameBoard.removeEventListener('touchstart', this.handleTouchStart);
        gameBoard.removeEventListener('touchend', this.handleTouchEnd);
      }
      
      // Update leaderboard when game closes
      this.updateLeaderboard();
    },
    // 2048 Game Methods
    startNewGame() {
      // Check if we have tries remaining
      if (this.gamesRemaining <= 0) {
        this.showGame2048 = false;
        return;
      }

      // Initialize empty board
      this.board = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill(0));
      this.score = 0;
      this.lastScoreForTokens = 0;
      this.gameOver = false;
      this.gameWon = false;
      
      // Spawn initial tiles
      this.spawnTile();
      this.spawnTile();
      
      // Remove localStorage logic for high score
      // this.highScore is now always from Firestore
    },
    spawnTile() {
      // Count empty spaces
      let emptySpaces = [];
      for (let row = 0; row < this.SIZE; row++) {
        for (let col = 0; col < this.SIZE; col++) {
          if (this.board[row][col] === 0) {
            emptySpaces.push({ row, col });
          }
        }
      }
      
      if (emptySpaces.length === 0) return;
      
      // Pick a random empty space
      const randomIndex = Math.floor(Math.random() * emptySpaces.length);
      const { row, col } = emptySpaces[randomIndex];
      
      // 90% chance for 2, 10% chance for 4
      this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
    },
    handleKeyDown(event) {
      if (this.gameOver || this.gameWon) return;
      
      let moved = false;
      
      switch (event.key) {
        case 'ArrowLeft':
          moved = this.moveLeft();
          break;
        case 'ArrowRight':
          moved = this.moveRight();
          break;
        case 'ArrowUp':
          moved = this.moveUp();
          break;
        case 'ArrowDown':
          moved = this.moveDown();
          break;
        default:
          return; // Exit if not arrow key
      }
      
      if (moved) {
        this.spawnTile();
        this.checkGameStatus();
      }
    },
    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    },
    handleTouchEnd(event) {
      if (this.gameOver || this.gameWon) return;
      
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;
      
      // Require a minimum swipe distance
      const minSwipeDistance = 30;
      
      let moved = false;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            moved = this.moveRight();
          } else {
            moved = this.moveLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            moved = this.moveDown();
          } else {
            moved = this.moveUp();
          }
        }
      }
      
      if (moved) {
        this.spawnTile();
        this.checkGameStatus();
      }
    },
    moveLeft() {
      let moved = false;
      for (let row = 0; row < this.SIZE; row++) {
        for (let col = 1; col < this.SIZE; col++) {
          if (this.board[row][col] !== 0) {
            let targetCol = col;
            while (targetCol > 0 && this.board[row][targetCol - 1] === 0) {
              targetCol--;
            }
            if (targetCol > 0 && this.board[row][targetCol - 1] === this.board[row][col]) {
              const mergedValue = this.board[row][col] * 2;
              this.board[row][targetCol - 1] = mergedValue;
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              this.earnTokens(mergedValue);
              if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
              }
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                this.earnTokens(1000);
              }
            } else if (targetCol !== col) {
              this.board[row][targetCol] = this.board[row][col];
              this.board[row][col] = 0;
              moved = true;
            }
          }
        }
      }
      return moved;
    },
    moveRight() {
      let moved = false;
      for (let row = 0; row < this.SIZE; row++) {
        for (let col = this.SIZE - 2; col >= 0; col--) {
          if (this.board[row][col] !== 0) {
            let targetCol = col;
            while (targetCol < this.SIZE - 1 && this.board[row][targetCol + 1] === 0) {
              targetCol++;
            }
            if (targetCol < this.SIZE - 1 && this.board[row][targetCol + 1] === this.board[row][col]) {
              const mergedValue = this.board[row][col] * 2;
              this.board[row][targetCol + 1] = mergedValue;
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              this.earnTokens(mergedValue);
              if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
              }
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                this.earnTokens(1000);
              }
            } else if (targetCol !== col) {
              this.board[row][targetCol] = this.board[row][col];
              this.board[row][col] = 0;
              moved = true;
            }
          }
        }
      }
      return moved;
    },
    moveUp() {
      let moved = false;
      for (let col = 0; col < this.SIZE; col++) {
        for (let row = 1; row < this.SIZE; row++) {
          if (this.board[row][col] !== 0) {
            let targetRow = row;
            while (targetRow > 0 && this.board[targetRow - 1][col] === 0) {
              targetRow--;
            }
            if (targetRow > 0 && this.board[targetRow - 1][col] === this.board[row][col]) {
              const mergedValue = this.board[row][col] * 2;
              this.board[targetRow - 1][col] = mergedValue;
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              this.earnTokens(mergedValue);
              if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
              }
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                this.earnTokens(1000);
              }
            } else if (targetRow !== row) {
              this.board[targetRow][col] = this.board[row][col];
              this.board[row][col] = 0;
              moved = true;
            }
          }
        }
      }
      return moved;
    },
    moveDown() {
      let moved = false;
      for (let col = 0; col < this.SIZE; col++) {
        for (let row = this.SIZE - 2; row >= 0; row--) {
          if (this.board[row][col] !== 0) {
            let targetRow = row;
            while (targetRow < this.SIZE - 1 && this.board[targetRow + 1][col] === 0) {
              targetRow++;
            }
            if (targetRow < this.SIZE - 1 && this.board[targetRow + 1][col] === this.board[row][col]) {
              const mergedValue = this.board[row][col] * 2;
              this.board[targetRow + 1][col] = mergedValue;
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              this.earnTokens(mergedValue);
              if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
              }
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                this.earnTokens(1000);
              }
            } else if (targetRow !== row) {
              this.board[targetRow][col] = this.board[row][col];
              this.board[row][col] = 0;
              moved = true;
            }
          }
        }
      }
      return moved;
    },
    checkGameStatus() {
      // Check if the game is over (no more possible moves)
      if (this.isBoardFull() && !this.canMove()) {
        this.gameOver = true;
        // Give some consolation tokens based on score when game over
        this.earnTokens(Math.floor(this.score / 100));
        this.updateLeaderboard();
      }
    },
    isBoardFull() {
      for (let row = 0; row < this.SIZE; row++) {
        for (let col = 0; col < this.SIZE; col++) {
          if (this.board[row][col] === 0) {
            return false;
          }
        }
      }
      return true;
    },
    canMove() {
      // Check for any possible merges horizontally
      for (let row = 0; row < this.SIZE; row++) {
        for (let col = 0; col < this.SIZE - 1; col++) {
          if (this.board[row][col] === this.board[row][col + 1]) {
            return true;
          }
        }
      }
      
      // Check for any possible merges vertically
      for (let col = 0; col < this.SIZE; col++) {
        for (let row = 0; row < this.SIZE - 1; row++) {
          if (this.board[row][col] === this.board[row + 1][col]) {
            return true;
          }
        }
      }
      
      return false;
    },
    getCellClass(value) {
      return {
        'cell-empty': value === 0,
        'cell-2': value === 2,
        'cell-4': value === 4,
        'cell-8': value === 8,
        'cell-16': value === 16,
        'cell-32': value === 32,
        'cell-64': value === 64,
        'cell-128': value === 128,
        'cell-256': value === 256,
        'cell-512': value === 512,
        'cell-1024': value === 1024,
        'cell-2048': value === 2048
      };
    },
    earnTokens(value) {
      // Calculate tokens based on score increments of 1000
      const currentScore = this.score;
      const scoreDifference = currentScore - this.lastScoreForTokens;
      const tokensFromScore = Math.floor(scoreDifference / 1000);
      
      if (tokensFromScore > 0) {
        this.playerTokens += tokensFromScore;
        this.lastScoreForTokens = currentScore - (scoreDifference % 1000);
        
        // Update game balance in parent component
        this.$emit('update-game-balance', this.playerTokens);
        
        // Save tokens immediately
        this.savePlayerTokens();
      }
      
      // Special bonus for winning
      if (value === 1000) {
        const winBonus = 10;
        this.playerTokens += winBonus;
        
        // Update game balance in parent component
        this.$emit('update-game-balance', this.playerTokens);
        
        // Save tokens immediately
        this.savePlayerTokens();
      }
    },
    async savePlayerTokens() {
      // Save tokens to leaderboard_2048
      const db = getFirestore(app);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return; // Should not happen if game is played
      await setDoc(doc(db, 'leaderboard_2048', user.uid), {
        name: this.userName,
        tokens: this.playerTokens,
        score: this.highScore
      }, { merge: true });
      // Emit to parent for Dashboard sync (if needed)
      this.$emit('update-game-balance', this.playerTokens);
    },
    updateLeaderboard: async function() {
      const db = getFirestore(app);
      const leaderboardRef = collection(db, 'leaderboard_2048');
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return; // Should not happen if game is played
      const playerDocRef = doc(leaderboardRef, user.uid);

      // Check if player already exists
      const playerDoc = await getDoc(playerDocRef);

      if (playerDoc.exists()) {
        const data = playerDoc.data();
        // Update if new score or tokens are higher
        if (this.highScore > data.score || this.playerTokens > data.tokens) {
          await setDoc(playerDocRef, {
            name: this.userName,
            score: Math.max(this.highScore, data.score),
            tokens: Math.max(this.playerTokens, data.tokens)
          });
        }
      } else {
        // Add new player
        await setDoc(playerDocRef, {
          name: this.userName,
          score: this.highScore,
          tokens: this.playerTokens
        });
      }
      // Refresh leaderboard
      await this.loadLeaderboard();
    },
    loadLeaderboard: async function() {
      const db = getFirestore(app);
      const leaderboardRef = collection(db, 'leaderboard_2048');
      const q = query(leaderboardRef, orderBy('score', 'desc'), limit(15));
      const querySnapshot = await getDocs(q);

      this.leaderboard = [];
      querySnapshot.forEach(doc => {
        this.leaderboard.push(doc.data());
      });
    },
    async fetchPlayerTokens() {
      // Fetch tokens and high score from leaderboard_2048
      const db = getFirestore(app);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        this.playerTokens = 0;
        this.highScore = 0;
        return;
      }
      const leaderboardDoc = await getDoc(doc(db, 'leaderboard_2048', user.uid));
      if (leaderboardDoc.exists()) {
        const data = leaderboardDoc.data();
        this.playerTokens = data.tokens || 0;
        this.highScore = data.score || 0;
      } else {
        this.playerTokens = 0;
        this.highScore = 0;
      }
    },
    async saveHighScore() {
      // Save high score to leaderboard_2048
      const db = getFirestore(app);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return; // Should not happen if game is played
      await setDoc(doc(db, 'leaderboard_2048', user.uid), {
        name: this.userName,
        tokens: this.playerTokens,
        score: this.highScore
      }, { merge: true });
    }
  },
  created() {
    // Load leaderboard when component is created
    this.loadLeaderboard();
    // Initialize game state when component is created
    this.initializeGameState();
  },
  beforeUnmount() {
    // Clean up event listeners when component is destroyed
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.removeEventListener('touchstart', this.handleTouchStart);
      gameBoard.removeEventListener('touchend', this.handleTouchEnd);
    }
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  },
  mounted() {
    this.$nextTick(() => {
    });
  }
};
</script>

<style scoped>
.game-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 15px;
}

.game-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.games-left {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #8f7a66;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
}

.games-left.warning {
  background-color: #f65e3b;
}

.cooldown {
  font-size: 0.9em;
  opacity: 0.9;
}

.game-intro {
  text-align: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.game-description {
  color: #776e65;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.play-btn {
  background-color: #8f7a66;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.play-btn:hover:not(:disabled) {
  background-color: #9f8a76;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.play-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Leaderboard Styles */
.leaderboard {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.leaderboard h2 {
  color: #776e65;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
}

.leaderboard-table {
  width: 100%;
}

.leaderboard-header {
  display: flex;
  font-weight: bold;
  background-color: #bbada0;
  color: white;
  padding: 10px;
  border-radius: 5px 5px 0 0;
  margin-bottom: 5px;
}

.leaderboard-row {
  display: flex;
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
}

.leaderboard-row:nth-child(even) {
  background-color: #f9f6f2;
}

.leaderboard-row:last-child {
  border-bottom: none;
  border-radius: 0 0 5px 5px;
}

.rank-col {
  width: 15%;
  text-align: center;
}

.player-col {
  width: 35%;
}

.score-col {
  width: 25%;
  text-align: right;
}

.tokens-col {
  width: 25%;
  text-align: right;
}

/* 2048 Game Styles */
.game-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 10px;
}

.game-modal-content {
  background-color: #faf8ef;
  border-radius: 8px;
  padding: 8px;
  width: 95%;
  max-width: 800px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: auto;
  height: 95vh;
  max-height: 800px;
}

.game-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto;
}

.header-left h2 {
  font-size: 1.6rem;
  color: #776e65;
  margin: 0;
  font-weight: bold;
}

.score-panel {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.score-container {
  background: linear-gradient(135deg, #bbada0 0%, #9f8a76 100%);
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
}

.score-label {
  color: #eee4da;
  font-size: 0.7rem;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.score-value {
  color: white;
  font-size: 1rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #776e65;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn .material-icons {
  font-size: 24px;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.game-board {
  background: linear-gradient(135deg, #bbada0 0%, #9f8a76 100%);
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  max-width: 400px;
  position: relative;
  margin: 0 auto;
}

.board-row {
  display: flex;
  gap: 4px;
  flex: 1;
  min-height: 0;
}

.board-cell {
  flex: 1;
  aspect-ratio: 1;
  min-width: 0;
  background-color: #cdc1b4;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0;
  margin: 0;
}

.cell-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: min(1.8vw, 24px);
  font-weight: bold;
  color: #776e65;
  transition: all 0.15s ease;
}

.cell-128 .cell-inner {
  font-size: min(1.6vw, 20px);
}

.cell-256 .cell-inner {
  font-size: min(1.6vw, 20px);
}

.cell-512 .cell-inner {
  font-size: min(1.6vw, 20px);
}

.cell-1024 .cell-inner {
  font-size: min(1.4vw, 18px);
}

.cell-2048 .cell-inner {
  font-size: min(1.4vw, 18px);
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(238, 228, 218, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.game-over-message, .game-won-message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.4rem;
  padding: 12px 24px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 10px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #8f7a66 0%, #7f6a56 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  width: auto;
  min-width: 120px;
}

.game-guide {
  background: rgba(187, 173, 160, 0.1);
  border-radius: 4px;
  padding: 8px;
  font-size: 0.9rem;
  color: #776e65;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  justify-content: center;
}

.guide-item:last-child {
  margin-bottom: 0;
}

.cell-empty {
  background-color: rgba(238, 228, 218, 0.35);
}

.cell-2 {
  background-color: #eee4da;
  color: #776e65;
}

.cell-4 {
  background-color: #ede0c8;
  color: #776e65;
}

.cell-8 {
  background-color: #f2b179;
  color: white;
}

.cell-16 {
  background-color: #f59563;
  color: white;
}

.cell-32 {
  background-color: #f67c5f;
  color: white;
}

.cell-64 {
  background-color: #f65e3b;
  color: white;
}

.cell-128 {
  background-color: #edcf72;
  color: white;
  font-size: min(1.8vw, 24px);
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.2381), inset 0 0 0 1px rgba(255, 255, 255, 0.14286);
}

.cell-256 {
  background-color: #edcc61;
  color: white;
  font-size: min(1.8vw, 24px);
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.31746), inset 0 0 0 1px rgba(255, 255, 255, 0.19048);
}

.cell-512 {
  background-color: #edc850;
  color: white;
  font-size: min(1.8vw, 24px);
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.39683), inset 0 0 0 1px rgba(255, 255, 255, 0.2381);
}

.cell-1024 {
  background-color: #edc53f;
  color: white;
  font-size: min(1.6vw, 20px);
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.47619), inset 0 0 0 1px rgba(255, 255, 255, 0.28571);
}

.cell-2048 {
  background-color: #edc22e;
  color: white;
  font-size: min(1.6vw, 20px);
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.55556), inset 0 0 0 1px rgba(255, 255, 255, 0.33333);
}

@media screen and (max-width: 768px) {
  .game-modal-content {
    height: 98vh;
    max-height: none;
  }

  .game-board {
    max-width: 350px;
  }

  .game-controls {
    max-width: 350px;
  }
}

@media screen and (max-width: 480px) {
  .game-modal-content {
    padding: 6px;
  }

  .game-content {
    padding: 6px;
  }

  .game-board {
    max-width: 300px;
  }

  .game-controls {
    max-width: 300px;
  }

  .game-guide {
    font-size: 0.8rem;
    padding: 6px;
  }
}

.tokens {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #8f7a66;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
}

.token-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.token-division {
  font-size: 0.9em;
  opacity: 0.9;
}
</style>