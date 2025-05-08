<template>
  <div class="game-container">
    <div class="dash-header">
      <h1>2048</h1>
      <div class="tokens">
        <span class="token-count">Tokens: {{ playerTokens }}</span>
      </div>
    </div>
    
    <div class="game-intro">
      <p class="game-description">Merge tiles to reach the 2048 tile in this addictive puzzle game!</p>
      <button class="play-btn" @click="playGame(2)">Play Now</button>
    </div>

    <!-- Leaderboard Section -->
    <div class="leaderboard">
      <h2>Leaderboard</h2>
      <div class="leaderboard-table">
        <div class="leaderboard-header">
          <div class="rank-col">Rank</div>
          <div class="player-col">Player</div>
          <div class="score-col">Score</div>
          <div class="tokens-col">Tokens</div>
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
          <h2>2048</h2>
          <div class="score-panel">
            <div class="score">Score: {{ score }}</div>
            <div class="high-score">High Score: {{ highScore }}</div>
            <div class="tokens">Tokens: {{ playerTokens }}</div>
          </div>
          <button class="close-btn" @click="closeGame">×</button>
        </div>
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
              :class="getCellClass(cell)"
            >
              {{ cell !== 0 ? cell : '' }}
            </div>
          </div>
        </div>
        <div class="game-controls">
          <button class="control-btn" @click="startNewGame">New Game</button>
          <div v-if="gameOver" class="game-over-message">Game Over!</div>
          <div v-if="gameWon" class="game-won-message">You Win!</div>
        </div>
        <div class="game-instructions">
          <p>Use arrow keys or swipe to move tiles. When two tiles with the same number touch, they merge into one!</p>
          <p>Get to the 2048 tile to win and earn tokens!</p>
        </div>
      </div>
    </div>

    <!-- Player Name Modal -->
    <div v-if="showNameModal" class="name-modal">
      <div class="name-modal-content">
        <h3>Enter Your Name</h3>
        <input type="text" v-model="playerName" placeholder="Enter your name" maxlength="15">
        <button @click="savePlayerName">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameComponent',
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
      
      // Player and token system
      playerName: '',
      playerTokens: 0,
      showNameModal: false,
      
      // Track tokens earned in current game for animations (optional enhancement)
      tokensEarnedThisMove: 0,
      
      // Leaderboard
      leaderboard: []
    };
  },
  methods: {
    playGame() {
      // Check if player has a name
      if (!this.playerName) {
        this.showNameModal = true;
        return;
      }
      
      this.showGame2048 = true;
      this.startNewGame();
      this.$nextTick(() => {
        window.addEventListener('keydown', this.handleKeyDown);
        // Add touch event listeners for mobile
        document.querySelector('.game-board').addEventListener('touchstart', this.handleTouchStart);
        document.querySelector('.game-board').addEventListener('touchend', this.handleTouchEnd);
      });
    },
    savePlayerName() {
      if (this.playerName.trim()) {
        this.showNameModal = false;
        
        // Load player tokens if they exist
        const savedTokens = localStorage.getItem(`2048_tokens_${this.playerName}`);
        if (savedTokens) {
          this.playerTokens = parseInt(savedTokens);
        }
        
        // Now we can start the game
        this.playGame();
      }
    },
    closeGame() {
      this.showGame2048 = false;
      window.removeEventListener('keydown', this.handleKeyDown);
      document.querySelector('.game-board')?.removeEventListener('touchstart', this.handleTouchStart);
      document.querySelector('.game-board')?.removeEventListener('touchend', this.handleTouchEnd);
      
      // Update leaderboard when game closes
      this.updateLeaderboard();
    },
    // 2048 Game Methods
    startNewGame() {
      // Initialize empty board
      this.board = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill(0));
      this.score = 0;
      this.gameOver = false;
      this.gameWon = false;
      
      // Spawn initial tiles
      this.spawnTile();
      this.spawnTile();
      
      // Load high score from localStorage
      const savedHighScore = localStorage.getItem(`2048_highscore_${this.playerName}`);
      if (savedHighScore) {
        this.highScore = parseInt(savedHighScore);
      } else {
        this.highScore = 0;
      }
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
      
      // Reset tokens earned this move
      this.tokensEarnedThisMove = 0;
      
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
        
        // Save tokens to localStorage after a successful move
        this.savePlayerTokens();
      }
    },
    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    },
    handleTouchEnd(event) {
      if (this.gameOver || this.gameWon) return;
      
      // Reset tokens earned this move
      this.tokensEarnedThisMove = 0;
      
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
        
        // Save tokens to localStorage after a successful move
        this.savePlayerTokens();
      }
    },
    moveLeft() {
      let moved = false;
      for (let row = 0; row < this.SIZE; row++) {
        for (let col = 1; col < this.SIZE; col++) {
          if (this.board[row][col] !== 0) {
            let targetCol = col;
            // Find the furthest empty cell or matching cell
            while (targetCol > 0 && this.board[row][targetCol - 1] === 0) {
              targetCol--;
            }
            // Check if we can merge with the cell to the left
            if (targetCol > 0 && this.board[row][targetCol - 1] === this.board[row][col]) {
              // Calculate merged value
              const mergedValue = this.board[row][col] * 2;
              this.board[row][targetCol - 1] = mergedValue;
              
              // Update score
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              
              // Earn tokens based on merged value
              this.earnTokens(mergedValue);
              
              // Update high score if needed
              if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem(`2048_highscore_${this.playerName}`, this.highScore);
              }
              // Check for win condition
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                // Bonus tokens for winning
                this.earnTokens(1000);
              }
            } else if (targetCol !== col) {
              // Move to the furthest empty cell
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
            // Find the furthest empty cell or matching cell
            while (targetCol < this.SIZE - 1 && this.board[row][targetCol + 1] === 0) {
              targetCol++;
            }
            // Check if we can merge with the cell to the right
            if (targetCol < this.SIZE - 1 && this.board[row][targetCol + 1] === this.board[row][col]) {
              // Calculate merged value
              const mergedValue = this.board[row][col] * 2;
              this.board[row][targetCol + 1] = mergedValue;
              
              // Update score
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              
              // Earn tokens based on merged value
              this.earnTokens(mergedValue);
              
              // Update high score if needed
              if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem(`2048_highscore_${this.playerName}`, this.highScore);
              }
              // Check for win condition
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                // Bonus tokens for winning
                this.earnTokens(1000);
              }
            } else if (targetCol !== col) {
              // Move to the furthest empty cell
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
            // Find the furthest empty cell or matching cell
            while (targetRow > 0 && this.board[targetRow - 1][col] === 0) {
              targetRow--;
            }
            // Check if we can merge with the cell above
            if (targetRow > 0 && this.board[targetRow - 1][col] === this.board[row][col]) {
              // Calculate merged value
              const mergedValue = this.board[row][col] * 2;
              this.board[targetRow - 1][col] = mergedValue;
              
              // Update score
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              
              // Earn tokens based on merged value
              this.earnTokens(mergedValue);
              
              // Update high score if needed
              if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem(`2048_highscore_${this.playerName}`, this.highScore);
              }
              // Check for win condition
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                // Bonus tokens for winning
                this.earnTokens(1000);
              }
            } else if (targetRow !== row) {
              // Move to the furthest empty cell
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
            // Find the furthest empty cell or matching cell
            while (targetRow < this.SIZE - 1 && this.board[targetRow + 1][col] === 0) {
              targetRow++;
            }
            // Check if we can merge with the cell below
            if (targetRow < this.SIZE - 1 && this.board[targetRow + 1][col] === this.board[row][col]) {
              // Calculate merged value
              const mergedValue = this.board[row][col] * 2;
              this.board[targetRow + 1][col] = mergedValue;
              
              // Update score
              this.score += mergedValue;
              this.board[row][col] = 0;
              moved = true;
              
              // Earn tokens based on merged value
              this.earnTokens(mergedValue);
              
              // Update high score if needed
              if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem(`2048_highscore_${this.playerName}`, this.highScore);
              }
              // Check for win condition
              if (mergedValue === 2048 && !this.gameWon) {
                this.gameWon = true;
                // Bonus tokens for winning
                this.earnTokens(1000);
              }
            } else if (targetRow !== row) {
              // Move to the furthest empty cell
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
      // Determine if this is a tile merge or a special bonus
      let tokensEarned = 0;
      
      if (value === 1000) {
        // This is the winning bonus
        tokensEarned = 50; // Set fixed bonus for winning
      } else if (value < 100) {
        // This is from score/100 when game over
        tokensEarned = value; // Use value directly as tokens for game over
      } else {
        // This is a regular tile merge - implement better balanced token rewards
        // Basic formula for tile merges: Higher tiles = exponentially more tokens
        switch (value) {
          case 4: tokensEarned = 1; break;
          case 8: tokensEarned = 1; break;
          case 16: tokensEarned = 2; break;
          case 32: tokensEarned = 2; break;
          case 64: tokensEarned = 3; break;
          case 128: tokensEarned = 4; break;
          case 256: tokensEarned = 5; break;
          case 512: tokensEarned = 7; break;
          case 1024: tokensEarned = 10; break;
          case 2048: tokensEarned = 15; break;
          default: tokensEarned = Math.floor(Math.log2(value) / 2); // Fallback formula
        }
      }
      
      if (tokensEarned > 0) {
        this.playerTokens += tokensEarned;
        this.tokensEarnedThisMove += tokensEarned;
      }
    },
    savePlayerTokens() {
      // Save tokens to localStorage, but only if we have a valid player name
      if (this.playerName) {
        localStorage.setItem(`2048_tokens_${this.playerName}`, this.playerTokens);
      }
    },
    updateLeaderboard() {
      // Get existing leaderboard
      let leaderboard = [];
      const savedLeaderboard = localStorage.getItem('2048_leaderboard');
      if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
      }
      
      // Check if player is already on leaderboard
      const playerIndex = leaderboard.findIndex(player => player.name === this.playerName);
      
      if (playerIndex !== -1) {
        // Update existing entry if score is higher
        if (this.highScore > leaderboard[playerIndex].score) {
          leaderboard[playerIndex].score = this.highScore;
          leaderboard[playerIndex].tokens = this.playerTokens;
        } else if (this.playerTokens > leaderboard[playerIndex].tokens) {
          // Or if tokens are higher
          leaderboard[playerIndex].tokens = this.playerTokens;
        }
      } else {
        // Add new entry
        leaderboard.push({
          name: this.playerName,
          score: this.highScore,
          tokens: this.playerTokens
        });
      }
      
      // Sort by score (high to low)
      leaderboard.sort((a, b) => b.score - a.score);
      
      // Keep only top 15 players
      if (leaderboard.length > 15) {
        leaderboard = leaderboard.slice(0, 15);
      }
      
      // Save leaderboard
      localStorage.setItem('2048_leaderboard', JSON.stringify(leaderboard));
      
      // Update component data
      this.leaderboard = leaderboard;
    },
    loadLeaderboard() {
      const savedLeaderboard = localStorage.getItem('2048_leaderboard');
      if (savedLeaderboard) {
        this.leaderboard = JSON.parse(savedLeaderboard);
      } else {
        // Initialize with some sample data if empty
        this.leaderboard = [
          { name: "Player 1", score: 10240, tokens: 320 },
          { name: "Player 2", score: 8500, tokens: 225 },
          { name: "Player 3", score: 6400, tokens: 180 }
        ];
        localStorage.setItem('2048_leaderboard', JSON.stringify(this.leaderboard));
      }
    }
  },
  created() {
    // Load leaderboard when component is created
    this.loadLeaderboard();
    
    // Check if there's a saved player name
    const savedName = localStorage.getItem('2048_player_name');
    if (savedName) {
      this.playerName = savedName;
      
      // Load player tokens if they exist
      const savedTokens = localStorage.getItem(`2048_tokens_${this.playerName}`);
      if (savedTokens) {
        this.playerTokens = parseInt(savedTokens);
      }
    }
  },
  beforeUnmount() {
    // Clean up event listeners when component is destroyed
    window.removeEventListener('keydown', this.handleKeyDown);
    document.querySelector('.game-board')?.removeEventListener('touchstart', this.handleTouchStart);
    document.querySelector('.game-board')?.removeEventListener('touchend', this.handleTouchEnd);
  },
  watch: {
    playerName(newName) {
      if (newName) {
        localStorage.setItem('2048_player_name', newName);
      }
    }
  }
};
</script>

<style scoped>
.game-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dash-header h1 {
  font-size: 2.5rem;
  color: #776e65;
  margin: 0;
}

.tokens {
  background-color: #8f7a66;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
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
  padding: 12px 25px;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background-color: #9f8a76;
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
}

.game-modal-content {
  background-color: #faf8ef;
  border-radius: 10px;
  padding: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
}

.game-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.game-modal-header h2 {
  font-size: 28px;
  color: #776e65;
  margin: 0;
}

.score-panel {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.score, .high-score {
  background-color: #bbada0;
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #776e65;
  position: absolute;
  top: 10px;
  right: 15px;
}

.game-board {
  background-color: #bbada0;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  touch-action: none; /* Prevents default touch actions */
}

.board-row {
  display: flex;
  gap: 10px;
}

.board-cell {
  width: 80px;
  height: 80px;
  background-color: #cdc1b4;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #776e65;
}

/* Cell colors based on value */
.cell-empty {
  background-color: #cdc1b4;
}

.cell-2 {
  background-color: #eee4da;
}

.cell-4 {
  background-color: #ede0c8;
}

.cell-8 {
  background-color: #f2b179;
  color: #f9f6f2;
}

.cell-16 {
  background-color: #f59563;
  color: #f9f6f2;
}

.cell-32 {
  background-color: #f67c5f;
  color: #f9f6f2;
}

.cell-64 {
  background-color: #f65e3b;
  color: #f9f6f2;
}

.cell-128 {
  background-color: #edcf72;
  color: #f9f6f2;
  font-size: 20px;
}

.cell-256 {
  background-color: #edcc61;
  color: #f9f6f2;
  font-size: 20px;
}

.cell-512 {
  background-color: #edc850;
  color: #f9f6f2;
  font-size: 20px;
}

.cell-1024 {
  background-color: #edc53f;
  color: #f9f6f2;
  font-size: 18px;
}

.cell-2048 {
  background-color: #edc22e;
  color: #f9f6f2;
  font-size: 18px;
}

.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.control-btn {
  background-color: #8f7a66;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.game-over-message, .game-won-message {
  font-weight: bold;
  font-size: 20px;
}

.game-over-message {
  color: #e74c3c;
}

.game-won-message {
  color: #2ecc71;
}

.game-instructions {
  color: #776e65;
  font-size: 14px;
  margin-top: 15px;
}

/* Player Name Modal */
.name-modal {
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
}

.name-modal-content {
  background-color: #faf8ef;
  border-radius: 10px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.name-modal-content h3 {
  color: #776e65;
  margin-top: 0;
  margin-bottom: 20px;
}

.name-modal-content input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 2px solid #bbada0;
  border-radius: 5px;
  font-size: 16px;
}

.name-modal-content button {
  background-color: #8f7a66;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .game-area {
    grid-template-columns: 1fr;
  }
  
  .board-cell {
    width: 60px;
    height: 60px;
    font-size: 20px;
  }
  
  .cell-128, .cell-256, .cell-512 {
    font-size: 18px;
  }
  
  .cell-1024, .cell-2048, .cell-3072 {
    font-size: 16px;
  }
  
  .score-panel {
    flex-direction: column;
    gap: 5px;
  }
}

@media screen and (max-width: 480px) {
  .board-cell {
    width: 50px;
    height: 50px;
    font-size: 18px;
  }
  
  .cell-128, .cell-256, .cell-512, .cell-1024, .cell-2048, .cell-3072 {
    font-size: 15px;
  }
  
  .game-modal-content {
    padding: 15px;
  }
  
  .leaderboard-header, .leaderboard-row {
    font-size: 14px;
  }
}
</style>