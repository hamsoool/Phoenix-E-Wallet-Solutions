<template>
  <div class="container">
    <!-- Fixed Sidebar Navigation -->
    <aside id="sidebar" :class="{ 'show': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <img src="../assets/images/newlogo.png" alt="Phoenix Logo">
        </div>
        <button class="close-btn" @click="closeSidebar">
          <span class="material-icons">close</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a href="#" :class="{ active: currentPage === 'dashboard' }" @click.prevent="setActivePage('dashboard')">
          <span class="material-icons">dashboard</span>
          <h3>Dashboard</h3>
        </a>
        <a href="#" :class="{ active: currentPage === 'profile' }" @click.prevent="setActivePage('profile')">
          <span class="material-icons">person</span>
          <h3>Profile</h3>
        </a>
        <a href="#" :class="{ active: currentPage === 'game' }" @click.prevent="setActivePage('game')">
          <span class="material-icons">sports_esports</span>
          <h3>Game</h3>
        </a>
        <a href="#" :class="{ active: currentPage === 'history' }" @click.prevent="setActivePage('history')">
          <span class="material-icons">history</span>
          <h3>History</h3>
        </a>
        <a href="#" :class="{ active: currentPage === 'help' }" @click.prevent="setActivePage('help')">
          <span class="material-icons">help</span>
          <h3>Help & Support</h3>
        </a>
        <a href="#" @click.prevent="logout">
          <span class="material-icons">logout</span>
          <h3>Logout</h3>
        </a>
      </nav>
    </aside>
    
    <!-- Main Content Area -->
    <main>
      <!-- Dashboard Content -->
      <div v-if="currentPage === 'dashboard'">
        <div class="dash-header">
          <h1>{{ pageTitles[currentPage] }}</h1>
          <div class="date">
            <input type="date" v-model="currentDate">
          </div>
        </div>

        <!-- Account Summary Cards -->
        <div class="insights">
          <div class="card balance">
            <span class="material-icons">account_balance_wallet</span>
            <div class="card-content">
              <h3>Balance</h3>
              <h1>${{ balanceData.amount }}</h1>
              <small>{{ balanceData.info }}</small>
            </div>
          </div>

          <div class="card income">
            <span class="material-icons">trending_up</span>
            <div class="card-content">
              <h3>Income</h3>
              <h1>${{ incomeData.amount }}</h1>
              <small>{{ incomeData.info }}</small>
            </div>
          </div>

          <div class="card expenses">
            <span class="material-icons">credit_card</span>
            <div class="card-content">
              <h3>Expenses</h3>
              <h1>${{ expensesData.amount }}</h1>
              <small>{{ expensesData.info }}</small>
            </div>
          </div>
        </div>

        <!-- Transaction History Preview -->
        <section class="recent-logs">
          <h2>Transaction History</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(transaction, index) in transactions" :key="index">
                  <td>${{ transaction.amount }}</td>
                  <td>{{ transaction.date }}</td>
                  <td>{{ transaction.time }}</td>
                  <td :class="transaction.status === 'Transaction Complete' ? 'success' : 'failed'">
                    {{ transaction.status }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <a href="#" @click.prevent="setActivePage('history')" class="view-all">View All Transactions</a>
        </section>
      </div>

      <!-- History Content -->
      <history-component v-if="currentPage === 'history'" />

      <!-- Profile Content -->
      <profile 
        v-if="currentPage === 'profile'" 
        :currentDate="currentDate"
        :pageTitles="pageTitles"
        :currentPage="currentPage"
        :userName="userName"
        @update-user-name="updateUserName"
      />

      <!-- Game Content -->
      <game-component 
        v-if="currentPage === 'game'" 
        :currentDate="currentDate"
      />

      <!-- Help & Support Content -->
      <help-support v-if="currentPage === 'help'" :currentDate="currentDate" />
    </main>

    <!-- Right Panel -->
    <aside id="right-panel" :class="{ 'show-right': isRightPanelOpen }">
      <div class="top-bar">
        <button id="menu-btn" class="menu-toggle" @click="openSidebar">
          <span class="material-icons">menu</span>
        </button>
        
        <div class="profile">
          <div class="info">
            <p>Hey, <b>{{ userName }}</b></p>
            <small>{{ accountType }}</small>
          </div>
          <div class="profile-photo">
            <span class="material-icons">account_circle</span>
          </div>
        </div>
      </div>

      <!-- Wallet Summary / Game Stats depending on page -->
      <section class="wallet-summary">
        <h2>{{ currentPage === 'game' ? 'Game Stats' : 'Wallet' }}</h2>
        <div class="wallet-card">
          <div class="card-header">
            <h3>{{ currentPage === 'game' ? 'Gaming Balance' : 'User Account' }}</h3>
            <span class="material-icons">{{ currentPage === 'game' ? 'stars' : 'credit_card' }}</span>
          </div>
          <div class="card-balance">
            <h1>${{ currentPage === 'game' ? gameBalance : walletBalance }}</h1>
            <p>{{ currentPage === 'game' ? 'Available for Games' : 'Available Balance' }}</p>
          </div>
          <div class="card-actions">
            <button class="action-btn" @click="addMoney">
              <span class="material-icons">add</span>
              Add {{ currentPage === 'game' ? 'Funds' : 'Money' }}
            </button>
            <button v-if="currentPage !== 'game'" class="action-btn" @click="sendMoney">
              <span class="material-icons">send</span>
              Send
            </button>
          </div>
        </div>
      </section>
    </aside>
  </div>
</template>

<script>
import HistoryComponent from './History.vue';
import HelpSupport from './HelpSupport.vue';
import Profile from './Profile.vue';
import GameComponent from './Game.vue';

export default {
  name: 'UserDashboard',
  components: {
    HistoryComponent,
    HelpSupport,
    Profile,
    GameComponent
  },
  data() {
    return {
      isSidebarOpen: false,
      isRightPanelOpen: false,
      currentPage: 'dashboard',
      currentDate: new Date().toISOString().split('T')[0],
      userName: 'Phoenix User',
      accountType: 'Premium Account',
      walletBalance: '8,965.25',
      gameBalance: '2,450.00', // Added game balance for game stats
      balanceData: {
        amount: '10,864.75',
        info: 'Last updated 24h ago'
      },
      incomeData: {
        amount: '2,450.00',
        info: '+15% from last month'
      },
      expensesData: {
        amount: '1,250.50',
        info: '-3% from last month'
      },
      pageTitles: {
        dashboard: 'Dashboard',
        profile: 'User Profile',
        game: 'Game Center',
        history: 'Transaction History',
        help: 'Help & Support',
        logout: 'Logout'
      },
      transactions: [
        { amount: '101.50', date: '04/15/25', time: '11:00 PM', status: 'Transaction Complete' },
        { amount: '102.75', date: '04/15/25', time: '10:45 PM', status: 'Transaction Complete' },
        { amount: '103.25', date: '04/14/25', time: '02:30 PM', status: 'Transaction Failed' },
        { amount: '104.00', date: '04/12/25', time: '09:15 AM', status: 'Transaction Failed' },
        { amount: '105.50', date: '04/10/25', time: '03:20 PM', status: 'Transaction Complete' }
      ]
    };
  },
  methods: {
    openSidebar() {
      this.isSidebarOpen = true;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    toggleRightPanel() {
      this.isRightPanelOpen = !this.isRightPanelOpen;
    },
    setActivePage(page) {
      this.currentPage = page;
      if (window.innerWidth <= 768) {
        this.closeSidebar();
      }
    },
    logout() {
      alert('Logging out...');
      // In a real application, you would handle the logout logic here
    },
    addMoney() {
      if (this.currentPage === 'game') {
        alert('Add Funds to Game Account functionality will be implemented here');
      } else {
        alert('Add Money functionality will be implemented here');
      }
    },
    sendMoney() {
      alert('Send Money functionality will be implemented here');
    },
    updateUserName(newName) {
      this.userName = newName;
    },
    initializeButtonEffects() {
      const allButtons = document.querySelectorAll('button');
      
      allButtons.forEach(button => {
        button.addEventListener('click', function() {
          this.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            this.style.transform = 'scale(1)';
          }, 100);
        });
      });
    }
  },
  mounted() {
    this.initializeButtonEffects();
    
    // Add event listener for window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false;
      }
      if (window.innerWidth > 640) {
        this.isRightPanelOpen = false;
      }
    });
  }
};
</script>
  
<style>
/* Base Styles & Variables */
:root {
  --color-primary: #ff5722;
  --color-primary-light: #ff9800;
  --color-white: #f4f3f3;
  --color-dark: #333;
  --color-dark-variant: #555;
  --color-light: #f0f0f0;
  --color-light-variant: #f8f9fa;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --card-padding: 14px;
  --border-radius: 6px;
  --box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  --transition: all 0.2s ease;
  --sidebar-width: 200px;
  --sidebar-width-collapsed: 60px;
  --right-panel-width: 260px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  background-color: var(--color-light-variant);
  color: var(--color-dark);
}

/* Container Layout - Modified to use 1fr for center content */
.container {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width);
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Sidebar Styles */
#sidebar {
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  height: 100vh;
  position: fixed;
  width: var(--sidebar-width);
  z-index: 20;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--color-light);
}

.logo {
  display: flex;
  justify-content: center;
}

.logo img {
  width: 100%;
  height: auto;
  margin-left: 0px;
  object-fit: contain;
}

.close-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark-variant);
}

.sidebar-nav {
  padding: 8px 0;
  flex-grow: 1;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  color: var(--color-dark-variant);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 4px;
  margin: 2px 6px;
}

.sidebar-nav a.active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.sidebar-nav a:hover:not(.active) {
  background-color: var(--color-light);
}

.sidebar-nav .material-icons {
  margin-right: 8px;
  font-size: 18px;
}

.sidebar-nav h3 {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Main Content Styles - Updated to maximize space */
main {
  position: fixed;
  left: var(--sidebar-width);
  right: var(--right-panel-width);
  top: 0;
  bottom: 0;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: var(--card-padding);
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
  margin-right: 10px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.date {
  background-color: var(--color-light-variant);
  padding: 5px 10px;
  border-radius: 4px;
}

.date input {
  border: none;
  background: transparent;
  color: var(--color-dark-variant);
  cursor: pointer;
}

/* Card Layout */
.insights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.card {
  background-color: var(--color-white);
  padding: var(--card-padding);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  border: 1px solid var(--color-light);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.card .material-icons {
  font-size: 22px;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.card h3 {
  color: var(--color-dark-variant);
  font-size: 0.8rem;
  margin-bottom: 4px;
  font-weight: 500;
}

.card h1 {
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.card small {
  color: var(--color-dark-variant);
  font-size: 0.7rem;
}

/* Table Styles */
.recent-logs {
  margin-top: 20px;
}

.recent-logs h2 {
  margin-bottom: 10px;
  color: var(--color-dark);
  font-size: 1rem;
  font-weight: 500;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-light);
  border-radius: var(--border-radius);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background-color: var(--color-light-variant);
}

th {
  padding: 8px 10px;
  text-align: left;
  color: var(--color-dark-variant);
  font-weight: 500;
  font-size: 0.8rem;
}

td {
  padding: 8px 10px;
  color: var(--color-dark-variant);
  border-top: 1px solid var(--color-light);
  font-size: 0.8rem;
}

tbody tr:hover {
  background-color: var(--color-light-variant);
}

.success {
  color: var(--color-success);
}

.failed {
  color: var(--color-danger);
}

.view-all {
  display: block;
  text-align: center;
  color: var(--color-primary);
  margin-top: 10px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8rem;
}

/* Right Panel Styles */
#right-panel {
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  height: 100vh;
  position: fixed;
  width: var(--right-panel-width);
  right: 0;
  top: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-light);
}

.profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info p {
  font-weight: 500;
  font-size: 0.8rem;
}

.info small {
  color: var(--color-dark-variant);
  font-size: 0.7rem;
}

.profile-photo .material-icons {
  font-size: 28px;
  color: var(--color-primary);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark-variant);
}

/* Wallet Card Styles */
.wallet-summary {
  padding: var(--card-padding);
  flex-grow: 1;
}

.wallet-summary h2 {
  margin-bottom: 10px;
  color: var(--color-dark);
  font-size: 1rem;
  font-weight: 500;
}

.wallet-card {
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-light));
  color: var(--color-white);
  padding: var(--card-padding);
  border-radius: var(--border-radius);
  margin-bottom: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h3 {
  font-size: 0.8rem;
  font-weight: 500;
}

.card-balance {
  margin-bottom: 14px;
}

.card-balance h1 {
  font-size: 1.4rem;
  margin-bottom: 4px;
}

.card-balance p {
  font-size: 0.7rem;
  opacity: 0.9;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.75rem;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.action-btn .material-icons {
  font-size: 14px;
}

/* Responsive Styles - Updated for better content area sizing */
@media screen and (max-width: 1200px) {
  :root {
    --sidebar-width: var(--sidebar-width-collapsed);
    --right-panel-width: 240px;
  }

  .container {
    grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width);
  }
  
  main {
    width: calc(100vw - var(--sidebar-width) - var(--right-panel-width));
  }

  .sidebar-nav h3 {
    display: none;
  }

  .logo img {
    width: 40px;
    height: 40px;
    margin: 0;
  }

  .insights {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 992px) {
  .insights {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  :root {
    --sidebar-width: 0;
  }
  
  .container {
    grid-template-columns: 1fr var(--right-panel-width);
  }

  main {
    margin-left: 0;
    width: calc(100vw - var(--right-panel-width));
  }

  #sidebar {
    left: -100%;
    width: 200px;
    transition: var(--transition);
  }

  #sidebar.show {
    left: 0;
  }

  .sidebar-nav h3 {
    display: inline;
  }

  .logo img {
    width: 100px;
    height: 60px;
  }

  .close-btn {
    display: inline-block;
  }

  .menu-toggle {
    display: inline-block;
  }
}

@media screen and (max-width: 640px) {
  :root {
    --right-panel-width: 0;
  }
  
  .container {
    grid-template-columns: 1fr;
  }

  main {
    margin-right: 0;
    margin-top: 50px;
    height: calc(100vh - 50px);
    width: 100vw;
  }

  #right-panel {
    right: -100%;
    width: 200px;
    transition: var(--transition);
  }

  #right-panel.show-right {
    right: 0;
  }

  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 89;
    height: 50px;
    background-color: var(--color-white);
  }

  .insights {
    grid-template-columns: 1fr;
  }

  .info {
    display: none;
  }

  .dash-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .date {
    width: 100%;
  }

  .card-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>