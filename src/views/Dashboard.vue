<!-- Template section -->
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
      <!-- Dashboard Header with Menu Button -->
      <div class="main-header">
        <button id="menu-btn" class="menu-toggle" @click="openSidebar">
          <span class="material-icons">menu</span>
        </button>
        <h1>{{ pageTitles[currentPage] }}</h1>
        <div class="date">
          <input type="date" v-model="currentDate">
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-if="currentPage === 'dashboard'">
        <!-- Financial Cards Row -->
        <div class="financial-cards">
          <!-- Wallet Card -->
          <div class="card wallet-card">
            <div class="card-content">
              <h3>Wallet Balance</h3>
              <h1>₱{{ walletBalance }}</h1>
            </div>
            <div class="card-actions">
              <button class="action-btn deposit" @click="showDepositModal = true">
                <span class="material-icons">add</span>
                Deposit
              </button>
              <button class="action-btn send" @click="showSendModal = true">
                <span class="material-icons">arrow_forward</span>
                Send
              </button>
              <button class="action-btn membership" @click="showMembershipModal = true">
                <span class="material-icons">card_membership</span>
                Pay Membership
              </button>
            </div>
          </div>
          
          <!-- Token Card -->
          <div class="card token-card">
            <div class="card-content">
              <h3>Game Tokens</h3>
              <h1>₱{{ gameBalance }}</h1>
            </div>
            <div class="card-actions">
              <button class="action-btn exchange" @click="showExchangeModal = true">
                <span class="material-icons">swap_horiz</span>
                Exchange
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction History Preview -->
        <section class="recent-logs">
          <h2>Transaction History</h2>
          <div class="table-wrapper">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <span class="material-icons loading-icon">sync</span>
              <p>Loading transactions...</p>
            </div>

            <!-- No Transactions Found -->
            <div v-else-if="recentTransactions.length === 0" class="no-transactions">
              <span class="material-icons">receipt_long</span>
              <p>No Transactions Found</p>
              <p class="sub-text">Your transaction history will appear here</p>
            </div>

            <!-- Transactions Table -->
            <table v-else>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in recentTransactions" :key="transaction.id">
                  <td>
                    <div class="transaction-details">
                      <span class="transaction-title">{{ transaction.title }}</span>
                      <span class="transaction-desc">{{ transaction.description }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['transaction-amount', transaction.type]">
                      {{ transaction.type === 'credit' ? '+' : '-' }}₱{{ transaction.amount }}
                    </span>
                  </td>
                  <td>{{ formatDateTime(transaction.dateTime) }}</td>
                  <td>
                    <span :class="['status-badge', 'status-' + transaction.status.toLowerCase()]">
                      {{ transaction.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <a href="#" @click.prevent="setActivePage('history')" class="view-all">View All Transactions</a>
        </section>
      </div>

      <!-- Modals -->
      <!-- Deposit Modal -->
      <div v-if="showDepositModal">
        <div class="modal-backdrop" @click="closeDepositModal"></div>
        <div class="modal-box">
          <h2>Deposit Funds</h2>
          <form @submit.prevent="handleDeposit">
            <div class="form-group">
              <label for="depositAmount">Amount (₱)</label>
              <input 
                type="number" 
                id="depositAmount" 
                v-model="depositAmount" 
                min="1" 
                step="0.01" 
                required
              >
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="showDepositModal = false">Cancel</button>
              <button type="submit" class="confirm-btn">Deposit</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Send Modal -->
      <div v-if="showSendModal">
        <div class="modal-backdrop" @click="closeSendModal"></div>
        <div class="modal-box">
          <h2>Send Funds</h2>
          <form @submit.prevent="handleSend">
            <div class="form-group">
              <label for="recipient">Recipient Address</label>
              <input 
                type="text" 
                id="recipient" 
                v-model="recipientAddress" 
                required
              >
            </div>
            <div class="form-group">
              <label for="sendAmount">Amount (₱)</label>
              <input 
                type="number" 
                id="sendAmount" 
                v-model="sendAmount" 
                min="1" 
                step="0.01" 
                required
              >
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="showSendModal = false">Cancel</button>
              <button type="submit" class="confirm-btn">Send</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Exchange Modal -->
      <div v-if="showExchangeModal">
        <div class="modal-backdrop" @click="closeExchangeModal"></div>
        <div class="modal-box">
          <h2>Exchange Tokens</h2>
          <form @submit.prevent="handleExchange">
            <div class="form-group">
              <label for="exchangeAmount">Amount to Exchange (₱)</label>
              <input 
                type="number" 
                id="exchangeAmount" 
                v-model="exchangeAmount" 
                min="1" 
                step="0.01" 
                required
              >
            </div>
            <div class="form-group">
              <label>Exchange Direction</label>
              <select v-model="exchangeDirection" required>
                <option value="walletToTokens">Wallet to Tokens</option>
                <option value="tokensToWallet">Tokens to Wallet</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="showExchangeModal = false">Cancel</button>
              <button type="submit" class="confirm-btn">Exchange</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Membership Modal -->
      <div v-if="showMembershipModal">
        <div class="modal-backdrop" @click="closeMembershipModal"></div>
        <div class="modal-box">
          <h2>Pay Membership</h2>
          <div class="membership-options">
            <div 
              class="membership-option" 
              :class="{ 'selected': selectedMembership === 'fullYear' }"
              @click="selectedMembership = 'fullYear'"
            >
              <h3>Full Year Membership</h3>
              <p class="price">₱100.00</p>
              <p class="description">Access to all features for one year</p>
            </div>
            <div 
              class="membership-option" 
              :class="{ 'selected': selectedMembership === 'semester' }"
              @click="selectedMembership = 'semester'"
            >
              <h3>Semester Membership</h3>
              <p class="price">₱50.00</p>
              <p class="description">Access to all features for one semester</p>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeMembershipModal">Cancel</button>
            <button 
              type="button" 
              class="confirm-btn" 
              @click="handleMembershipPayment"
              :disabled="!selectedMembership || isProcessing"
            >
              <span v-if="isProcessing" class="loading-spinner"></span>
              <span v-else>Pay Now</span>
            </button>
          </div>
        </div>
      </div>

      <!-- History Content -->
      <history-component v-if="currentPage === 'history'" :transactions="transactions" />

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
  </div>
</template>

<script>
import HistoryComponent from './History.vue';
import HelpSupport from './HelpSupport.vue';
import Profile from './Profile.vue';
import GameComponent from './Game.vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';

export default {
  name: 'Dashboard',
  components: {
    HistoryComponent,
    HelpSupport,
    Profile,
    GameComponent
  },
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'dashboard',
      currentDate: new Date().toISOString().split('T')[0],
      userName: 'Phoenix User',
      walletBalance: 8965.25,
      gameBalance: 2450.00,
      showDepositModal: false,
      showSendModal: false,
      showExchangeModal: false,
      showMembershipModal: false,
      depositAmount: 0,
      sendAmount: 0,
      exchangeAmount: 0,
      recipientAddress: '',
      exchangeDirection: 'walletToTokens',
      selectedMembership: null,
      isProcessing: false,
      membershipPrices: {
        fullYear: 100,
        semester: 50
      },
      pageTitles: {
        dashboard: 'Dashboard',
        profile: 'User Profile',
        game: 'Game Center',
        history: 'Transaction History',
        help: 'Help & Support',
        logout: 'Logout'
      },
      loading: true,
      transactions: [],
      error: null
    };
  },
  computed: {
    recentTransactions() {
      // Return only the 5 most recent transactions
      return this.transactions.slice(0, 5);
    }
  },
  async created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.router = useRouter();

    // Check authentication state
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.user = user;
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(this.db, "users", user.uid));
        if (userDoc.exists()) {
          this.userData = userDoc.data();
          // Update wallet and game balances
          this.walletBalance = this.userData.walletBalance || 0;
          this.gameBalance = this.userData.gameBalance || 0;
        }
      } else {
        // No user is signed in, redirect to login
        this.router.push('/login');
      }
    });

    await this.fetchTransactions();
  },
  methods: {
    openSidebar() {
      this.isSidebarOpen = true;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    setActivePage(page) {
      this.currentPage = page;
      if (window.innerWidth <= 768) {
        this.closeSidebar();
      }
    },
    async logout() {
      try {
        await signOut(this.auth);
        this.router.push('/login');
      } catch (error) {
        console.error("Logout error:", error);
        alert("Error signing out. Please try again.");
      }
    },
    handleDeposit() {
      if (this.depositAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      
      this.walletBalance = Number(this.walletBalance) + Number(this.depositAmount);
      this.addTransaction(this.depositAmount, 'Transaction Complete', 'Deposit');
      this.showDepositModal = false;
      this.depositAmount = 0;
    },
    handleSend() {
      if (this.sendAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      if (this.sendAmount > this.walletBalance) {
        alert('Insufficient funds');
        return;
      }
      if (!this.recipientAddress) {
        alert('Please enter a recipient address');
        return;
      }

      this.walletBalance = Number(this.walletBalance) - Number(this.sendAmount);
      this.addTransaction(this.sendAmount, 'Transaction Complete', 'Send');
      this.showSendModal = false;
      this.sendAmount = 0;
      this.recipientAddress = '';
    },
    handleExchange() {
      if (this.exchangeAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (this.exchangeDirection === 'walletToTokens') {
        if (this.exchangeAmount > this.walletBalance) {
          alert('Insufficient wallet balance');
          return;
        }
        this.walletBalance = Number(this.walletBalance) - Number(this.exchangeAmount);
        this.gameBalance = Number(this.gameBalance) + Number(this.exchangeAmount);
      } else {
        if (this.exchangeAmount > this.gameBalance) {
          alert('Insufficient token balance');
          return;
        }
        this.gameBalance = Number(this.gameBalance) - Number(this.exchangeAmount);
        this.walletBalance = Number(this.walletBalance) + Number(this.exchangeAmount);
      }

      this.addTransaction(this.exchangeAmount, 'Transaction Complete', 'Exchange');
      this.showExchangeModal = false;
      this.exchangeAmount = 0;
    },
    closeMembershipModal() {
      this.showMembershipModal = false;
      this.selectedMembership = null;
      this.isProcessing = false;
    },
    async handleMembershipPayment() {
      if (!this.selectedMembership) return;
      
      this.isProcessing = true;
      
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('No user logged in');
        }

        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.uid);
        
        // Check if user has sufficient balance
        if (this.walletBalance < this.membershipPrices[this.selectedMembership]) {
          throw new Error('Insufficient balance');
        }

        // Calculate membership expiry date
        const now = new Date();
        const expiryDate = new Date(now);
        if (this.selectedMembership === 'fullYear') {
          expiryDate.setFullYear(now.getFullYear() + 1);
        } else {
          // For semester, add 6 months
          expiryDate.setMonth(now.getMonth() + 6);
        }

        // Create transaction record
        const transactionRef = await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          type: 'membership',
          amount: this.membershipPrices[this.selectedMembership],
          status: 'Completed',
          title: `${this.selectedMembership === 'fullYear' ? 'Full Year' : 'Semester'} Membership Payment`,
          description: 'Membership fee payment',
          dateTime: serverTimestamp(),
          reference: `#MEM-${Math.random().toString(36).substr(2, 7)}`,
          membershipType: this.selectedMembership,
          expiryDate: expiryDate
        });

        // Update user's wallet balance
        const newBalance = this.walletBalance - this.membershipPrices[this.selectedMembership];
        await updateDoc(userRef, {
          walletBalance: newBalance,
          membershipType: this.selectedMembership,
          membershipExpiryDate: expiryDate
        });

        // Update local state
        this.walletBalance = newBalance;
        
        // Show success message
        alert('Membership payment successful!');
        
        // Close modal
        this.closeMembershipModal();

      } catch (error) {
        console.error('Error processing membership payment:', error);
        alert(error.message || 'Error processing payment. Please try again.');
      } finally {
        this.isProcessing = false;
      }
    },
    addTransaction(amount, status, type) {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      this.transactions.unshift({
        amount: Number(amount).toFixed(2),
        date,
        time,
        status: `${type} - ${status}`
      });

      // Keep only the latest 5 transactions
      if (this.transactions.length > 5) {
        this.transactions.pop();
      }
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
    },
    async fetchTransactions() {
      this.loading = true;
      this.error = null;
      
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user) {
          throw new Error('No user logged in');
        }

        const db = getFirestore(app);
        const transactionsRef = collection(db, 'transactions');
        
        // Query transactions for the current user, ordered by date, limited to 5
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid),
          orderBy('dateTime', 'desc'),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        this.transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      } catch (error) {
        console.error('Error fetching transactions:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    formatDateTime(timestamp) {
      if (!timestamp) return '';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    }
  },
  mounted() {
    this.initializeButtonEffects();
    
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false;
      }
    });
  }
};
</script>

<style>
/* Existing styles remain unchanged, adding modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-white);
  padding: 24px;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--box-shadow);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: var(--color-dark);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-dark-variant);
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-light);
  border-radius: 5px;
  font-size: 0.9rem;
  color: var(--color-dark);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.cancel-btn {
  background-color: var(--color-light);
  color: var(--color-dark);
}

.cancel-btn:hover {
  background-color: var(--color-light-variant);
}

.confirm-btn {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.confirm-btn:hover {
  background-color: var(--color-primary-light);
}

.confirm-btn:disabled {
  background-color: var(--color-light-variant);
  cursor: not-allowed;
}

/* Membership modal specific styles */
.membership-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.membership-option {
  border: 2px solid var(--color-light);
  border-radius: var(--border-radius);
  padding: 15px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.membership-option.selected {
  border-color: var(--color-primary);
  background-color: rgba(255, 87, 34, 0.05);
}

.option-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.option-header .material-icons {
  font-size: 24px;
  color: var(--color-primary);
  margin-bottom: 5px;
}

.option-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-dark);
  margin: 0;
}

.option-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 5px;
}

.option-description {
  font-size: 0.8rem;
  color: var(--color-dark-variant);
  text-align: center;
}

/* Existing styles */
:root {
  --color-primary: #ff5722;
  --color-primary-light: #ff9800;
  --color-wallet: #ff5722;
  --color-token: #f8f8f8;
  --color-white: #f4f3f3;
  --color-dark: #333;
  --color-dark-variant: # secrecy;
  --color-light: #f0f0f0;
  --color-light-variant: #dbdcde;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --card-padding: 20px;
  --border-radius: 10px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --transition: all 0.3s ease;
  --sidebar-width: 200px;
  --sidebar-width-collapsed: 60px;
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

.container {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

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

main {
  position: fixed;
  left: var(--sidebar-width);
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: var(--card-padding);
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-light);
}

.date {
  background-color: var(--color-light-variant);
  padding: 5px 10px;
  border-radius: var(--border-radius);
}

.date input {
  border: none;
  background: transparent;
  color: var(--color-dark-variant);
  cursor: pointer;
}

.financial-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.card {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  overflow: hidden;
  border: none;
  padding: 24px;
  height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.wallet-card, .token-card {
  background-color: var(--color-primary);
  color: white;
}

.wallet-card h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.wallet-card h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 25px;
}

.token-card h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.token-card h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 30px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
}

.wallet-card .action-btn, .token-card .action-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.action-btn .material-icons {
  font-size: 16px;
}

.recent-logs {
  margin-top: 30px;
  background-color: var(--color-white);
  padding: var(--card-padding);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.recent-logs h2 {
  margin-bottom: 15px;
  color: var(--color-dark);
  font-size: 1.1rem;
  font-weight: 600;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-light);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background-color: var(--color-light-variant);
}

th {
  padding: 12px 15px;
  text-align: left;
  color: var(--color-dark-variant);
  font-weight: 500;
  font-size: 0.85rem;
}

td {
  padding: 12px 15px;
  color: var(--color-dark-variant);
  border-top: 1px solid var(--color-light);
  font-size: 0.85rem;
}

tbody tr:hover {
  background-color: var(--color-light-variant);
}

.success {
  color: var(--color-success);
  font-weight: 500;
}

.failed {
  color: var(--color-danger);
  font-weight: 500;
}

.view-all {
  display: block;
  text-align: center;
  color: var(--color-primary);
  margin-top: 15px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 8px;
  transition: var(--transition);
}

.view-all:hover {
  text-decoration: underline;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark-variant);
}

@media screen and (max-width: 1200px) {
  :root {
    --sidebar-width: var(--sidebar-width-collapsed);
  }

  .container {
    grid-template-columns: var(--sidebar-width) 1fr;
  }
  
  main {
    width: calc(100vw - var(--sidebar-width));
  }

  .sidebar-nav h3 {
    display: none;
  }

  .logo img {
    width: 40px;
    height: 40px;
    margin: 0;
  }
}

@media screen and (max-width: 900px) {
  .financial-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media screen and (max-width: 768px) {
  :root {
    --sidebar-width: 0;
  }
  
  .container {
    grid-template-columns: 1fr;
  }

  main {
    margin-left: 0;
    width: 100vw;
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

@media screen and (max-width: 540px) {
  main {
    padding: 15px;
  }
  
  .financial-cards {
    grid-template-columns: 1fr;
  }
  
  .main-header {
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

.membership-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.membership-option {
  border: 2px solid #eee;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.membership-option:hover {
  border-color: var(--color-primary);
}

.membership-option.selected {
  border-color: var(--color-primary);
  background-color: rgba(255, 106, 0, 0.05);
}

.membership-option h3 {
  margin-bottom: 10px;
  color: var(--color-dark);
}

.membership-option .price {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 10px;
}

.membership-option .description {
  color: #666;
  font-size: 14px;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-content {
  max-width: 600px;
  width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #eee;
  color: #666;
}

.confirm-btn {
  background-color: var(--color-primary);
  color: white;
}

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover {
  background-color: var(--color-primary-light);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-icon {
  font-size: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.no-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.no-transactions .material-icons {
  font-size: 48px;
  margin-bottom: 16px;
  color: #999;
}

.no-transactions p {
  font-size: 16px;
  margin-bottom: 8px;
}

.no-transactions .sub-text {
  font-size: 14px;
  color: #999;
}

.transaction-details {
  display: flex;
  flex-direction: column;
}

.transaction-title {
  font-weight: 500;
  color: var(--color-dark);
}

.transaction-desc {
  font-size: 12px;
  color: #666;
}

.transaction-amount {
  font-weight: 600;
}

.transaction-amount.credit {
  color: #2e7d32;
}

.transaction-amount.debit {
  color: #c62828;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-failed {
  background-color: #ffebee;
  color: #c62828;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.view-all {
  display: inline-block;
  margin-top: 16px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

/* New modal box style */
.modal-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  padding: 32px 24px;
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Optional: Add a subtle overlay for focus, but not opaque */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15);
  z-index: 1000;
}
</style>