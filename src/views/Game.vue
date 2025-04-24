<template>
  <div class="game-container">
    <div class="dash-header">
      <h1>{{ pageTitle }}</h1>
      <div class="date">
        <input type="date" :value="currentDate" @input="$emit('update:currentDate', $event.target.value)">
      </div>
    </div>
    
    <div class="game-header">
      <h2>Games</h2>
      <div class="filter">
        <select v-model="selectedFilter" @change="filterGames">
          <option value="all">All Games</option>
          <option value="popular">Popular</option>
          <option value="new">New</option>
        </select>
      </div>
    </div>
    
    <div class="game-area">
      <div v-for="(game, index) in displayedGames" :key="index" class="game-card">
        <div class="game-image">
          <span class="material-icons">sports_esports</span>
        </div>
        <div class="game-details">
          <h3 class="game-title">{{ game.title }}</h3>
          <p class="game-description">{{ game.description }}</p>
          <button class="play-btn" @click="playGame(game.id)">Play Now</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameComponent',
  props: {
    currentDate: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      pageTitle: 'Game Center',
      selectedFilter: 'all',
      games: [
        {
          id: 1,
          title: 'Lucky Spin',
          description: 'Try your luck with our spinning wheel game and win big prizes!',
          category: 'popular'
        },

      ],
      displayedGames: []
    };
  },
  methods: {
    filterGames() {
      if (this.selectedFilter === 'all') {
        this.displayedGames = this.games;
      } else {
        this.displayedGames = this.games.filter(game => game.category === this.selectedFilter);
      }
    },
    playGame(gameId) {
      alert(`Starting game #${gameId}. Game functionality will be implemented in the future.`);
    }
  },
  created() {
    // Initialize displayed games when component is created
    this.filterGames();
  }
};
</script>

<style scoped>
.game-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.game-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.game-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.game-card:hover {
  transform: translateY(-5px);
}

.game-image {
  height: 180px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-image .material-icons {
  font-size: 64px;
  color: var(--color-primary);
}

.game-details {
  padding: 15px;
}

.game-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.game-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.play-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background-color: rgb(233, 30, 7);
}

.filter select {
  padding: 8px 12px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .game-area {
    grid-template-columns: 1fr;
  }
}
</style>