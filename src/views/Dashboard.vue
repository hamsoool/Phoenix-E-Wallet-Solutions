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
          <span class="material-icons">help_outline</span>
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
        <div class="current-datetime">
          {{ formattedDateTime }}
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
              <button class="action-btn membership" @click="showMembershipModal = true">
                <span class="material-icons">card_membership</span>
                Pay Membership
              </button>
            </div>
          </div>
          
          <!-- $ASH Card -->
          <div class="card token-card">
            <div class="card-content">
              <h3>$ASH Balance</h3>
              <h1>$ASH {{ gameBalance }}</h1>
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
                      <template v-if="transaction.title === 'Exchange Transaction' && transaction.exchangeDirection === 'tokensToWallet'">
                        {{ transaction.type === 'credit' ? '+' : '-' }}₱{{ transaction.amount }}
                      </template>
                      <template v-else-if="transaction.paymentMethod === 'tokens'">
                        {{ transaction.type === 'credit' ? '+' : '-' }}$ASH {{ transaction.amount }}
                      </template>
                      <template v-else>
                        {{ transaction.type === 'credit' ? '+' : '-' }}₱{{ transaction.amount }}
                      </template>
                    </span>
                  </td>
                  <td>{{ transaction.formattedDateTime }}</td>
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
        <div class="modal-box exchange-modal-box">
          <div class="exchange-modal-header">
            <span class="material-icons" style="font-size: 2rem; color: #ff6a00; margin-right: 8px;">swap_horiz</span>
            <h2 style="margin: 0; color: #ff6a00; font-weight: 700; font-size: 1.3rem; letter-spacing: 0.5px;">Exchange $ASH</h2>
          </div>
          <div class="conversion-rate-info">
            <span>Conversion Rate: <b>10 $ASH = 1 PHP</b> &nbsp;|&nbsp; <b>1 PHP = 10 $ASH</b></span>
          </div>
          <form @submit.prevent="handleExchange">
            <div class="form-group">
              <label for="exchangeAmount">Amount to Exchange</label>
              <input 
                type="number" 
                id="exchangeAmount" 
                v-model="exchangeAmount" 
                min="1" 
                step="0.01" 
                required
                class="exchange-input"
              >
            </div>
            <div class="form-group">
              <label>Exchange Direction</label>
              <select v-model="exchangeDirection" required class="exchange-select">
                <option value="walletToTokens">Wallet to $ASH</option>
                <option value="tokensToWallet">$ASH to Wallet</option>
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
              :class="{ 
                'selected': selectedMembership === 'fullYear',
                'disabled': membershipStatus.active 
              }"
              @click="!membershipStatus.active && (selectedMembership = 'fullYear')"
            >
              <h3>Phoenix</h3>
              <p class="price">₱100.00</p>
              <p class="description">Become an ELITE member for one year</p>
            </div>
            <div 
              class="membership-option" 
              :class="{ 
                'selected': selectedMembership === 'semester',
                'disabled': membershipStatus.active 
              }"
              @click="!membershipStatus.active && (selectedMembership = 'semester')"
            >
              <h3>Half-Winged Phoenix</h3>
              <p class="price">₱50.00</p>
              <p class="description">Become an ELITE member for one semester</p>
            </div>
          </div>
          <div v-if="membershipStatus.active" class="membership-warning">
            <span class="material-icons">info</span>
            You currently have an active {{ membershipStatus.type }} membership until {{ membershipStatus.expiry }}
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeMembershipModal">Cancel</button>
            <button 
              type="button" 
              class="confirm-btn" 
              @click="openPaymentMethodModal"
              :disabled="!selectedMembership || membershipStatus.active || isProcessing"
            >
              <span v-if="isProcessing" class="loading-spinner"></span>
              <span v-else>{{ membershipStatus.active ? 'Membership Active' : 'Pay Now' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Method Modal -->
      <div v-if="showPaymentMethodModal">
        <div class="modal-backdrop" @click="closePaymentMethodModal"></div>
        <div class="modal-box">
          <h2>Select Payment Method</h2>
          <div v-if="errorMessage" class="error-message" style="color: #dc3545; margin-bottom: 10px;">
            {{ errorMessage }}
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select v-model="selectedPaymentMethod" required>
              <option value="wallet">Wallet Balance (₱{{ walletBalance }})</option>
              <option value="tokens">$ASH Balance (₱{{ gameBalance }})</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closePaymentMethodModal">Cancel</button>
            <button 
              type="button" 
              class="confirm-btn" 
              @click="handleMembershipPayment"
              :disabled="!selectedPaymentMethod || isProcessing"
            >
              <span v-if="isProcessing" class="loading-spinner"></span>
              <span v-else>Confirm Payment</span>
            </button>
          </div>
        </div>
      </div>

      <!-- History Content -->
      <history-component 
        v-if="currentPage === 'history'" 
        :transactions="transactions"
        @refresh-transactions="fetchTransactions"
      />

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
        :initialGameBalance="gameBalance"
        @update-game-balance="updateGameBalance"
      />

      <!-- Help & Support Content -->
      <help-support v-if="currentPage === 'help'" />

      <!-- Add this at the end of your template, with other modals -->
      <div class="modal-overlay" v-if="showTransactionSuccessModal">
        <div class="modal-container">
          <div class="modal-content">
            <div class="modal-icon">
              <i class='bx bx-check-circle'></i>
            </div>
            <h3>Success!</h3>
            <p>{{ transactionSuccessMessage }}</p>
            <div class="modal-buttons">
              <button class="modal-button confirm" @click="showTransactionSuccessModal = false">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import HistoryComponent from './History.vue';
import Profile from './Profile.vue';
import GameComponent from './Game.vue';
import HelpSupport from './HelpSupport.vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, onSnapshot, increment, setDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';

export default {
  name: 'Dashboard',
  components: {
    HistoryComponent,
    Profile,
    GameComponent,
    HelpSupport
  },
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'dashboard',
      currentDate: new Date().toISOString().split('T')[0],
      userName: 'Phoenix User',
      walletBalance: 0,
      gameBalance: 0,
      showDepositModal: false,
      showSendModal: false,
      showExchangeModal: false,
      showMembershipModal: false,
      showPaymentMethodModal: false,
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
      error: null,
      now: new Date(),
      transactionListener: null,
      selectedPaymentMethod: 'wallet',
      errorMessage: '',
      isInitialized: false,
      user: null,
      userData: null,
      showTransactionSuccessModal: false,
      transactionSuccessMessage: '',
      exchangePhpAmount: 0
    };
  },
  computed: {
    recentTransactions() {
      // Return only the 5 most recent transactions
      return this.transactions.slice(0, 5);
    },
    formattedDateTime() {
      return this.now.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    },
    membershipStatus() {
      if (this.userData && this.userData.membershipExpiry) {
        const expiry = this.userData.membershipExpiry.toDate();
        const now = new Date();
        if (expiry > now) {
          const membershipType = this.userData.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix';
          const formattedExpiry = expiry.toLocaleDateString();
          return {
            active: true,
            type: membershipType,
            expiry: formattedExpiry
          };
        }
      }
      return {
        active: false,
        type: 'Regular Member',
        expiry: null
      };
    }
  },
  created() {
    this.initializeApp();
  },
  methods: {
    async initializeApp() {
      try {
        this.loading = true;
        console.log('Initializing app...');
        
        // Initialize Firebase services
        this.auth = getAuth(app);
        this.db = getFirestore(app);
        this.router = useRouter();
        
        // Check if user is already authenticated
        const currentUser = this.auth.currentUser;
        
        if (currentUser) {
          console.log('User already authenticated:', currentUser.uid);
          await this.handleUserAuthenticated(currentUser);
        } else {
          console.log('Waiting for authentication state...');
          // Set up authentication state listener
          onAuthStateChanged(this.auth, async (user) => {
            if (user) {
              console.log('User authenticated:', user.uid);
              await this.handleUserAuthenticated(user);
            } else {
              console.log('No user authenticated, redirecting to login');
              this.router.push('/login');
            }
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        this.error = error.message;
      }
    },
    
    async handleUserAuthenticated(user) {
      try {
        console.log('Handling authenticated user:', user.uid);
        this.user = user;
        
        // Load user data
        await this.loadUserData();
        
        // Set up transaction listener
        await this.setupTransactionsListener();
        
        // Initial fetch of transactions
        await this.loadTransactions();
        
        this.isInitialized = true;
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error handling authenticated user:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async loadUserData() {
      try {
        console.log('Loading user data for:', this.user.uid);
        const userDoc = await getDoc(doc(this.db, "users", this.user.uid));
        
        if (userDoc.exists()) {
          this.userData = userDoc.data();
          console.log('User data loaded:', this.userData);
          
          // Update wallet and game balances
          this.walletBalance = Number(this.userData.walletBalance || 0);
          this.gameBalance = Number(this.userData.gameBalance || 0);
          
          console.log('Balances set - Wallet:', this.walletBalance, 'Game:', this.gameBalance);
        } else {
          console.warn('User document does not exist');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
      }
    },
    
    async setupTransactionsListener() {
      try {
        console.log('Setting up transaction listener');
        
        if (this.transactionListener) {
          console.log('Cleaning up existing listener');
          this.transactionListener();
          this.transactionListener = null;
        }
        
        const transactionsRef = collection(this.db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', this.user.uid),
          orderBy('dateTime', 'desc')
        );
        
        console.log('Creating snapshot listener');
        this.transactionListener = onSnapshot(q, (snapshot) => {
          console.log('Transaction snapshot received:', snapshot.docs.length, 'documents');
          this.handleTransactionSnapshot(snapshot);
        }, (error) => {
          console.error('Error in transaction listener:', error);
        });
        
        console.log('Transaction listener setup complete');
      } catch (error) {
        console.error('Error setting up transaction listener:', error);
        throw error;
      }
    },
    
    handleTransactionSnapshot(snapshot) {
      try {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const formattedTransaction = this.formatTransaction(change.doc.id, data);
          
          if (change.type === 'added') {
            console.log('Transaction added:', formattedTransaction.id);
            // Check if transaction already exists
            const existingIndex = this.transactions.findIndex(t => t.id === formattedTransaction.id);
            if (existingIndex === -1) {
              this.transactions.unshift(formattedTransaction);
            }
          } else if (change.type === 'modified') {
            console.log('Transaction modified:', formattedTransaction.id);
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id === formattedTransaction.id);
            if (index !== -1) {
              this.transactions.splice(index, 1, formattedTransaction);
            }
          } else if (change.type === 'removed') {
            console.log('Transaction removed:', formattedTransaction.id);
            // Remove transaction
            const index = this.transactions.findIndex(t => t.id === formattedTransaction.id);
            if (index !== -1) {
              this.transactions.splice(index, 1);
            }
          }
        });
        
        // Sort transactions by dateTime descending
        this.transactions.sort((a, b) => b.dateTime - a.dateTime);
        console.log('Updated transactions array:', this.transactions.length);
      } catch (error) {
        console.error('Error processing transaction snapshot:', error);
      }
    },
    
    formatTransaction(id, data) {
      // Format date
      let dateTime;
      if (data.dateTime && typeof data.dateTime.toDate === 'function') {
        dateTime = data.dateTime.toDate();
      } else if (data.dateTime instanceof Date) {
        dateTime = data.dateTime;
      } else {
        dateTime = new Date();
      }
      
      // Format other fields
      return {
        id: id,
        ...data,
        dateTime: dateTime,
        formattedDateTime: this.formatDateTime(dateTime),
        amount: Number(data.amount || 0).toFixed(2),
        walletBalance: Number(data.walletBalance || 0).toFixed(2),
        gameBalance: Number(data.gameBalance || 0).toFixed(2),
        previousWalletBalance: data.previousWalletBalance ? Number(data.previousWalletBalance).toFixed(2) : null,
        previousGameBalance: data.previousGameBalance ? Number(data.previousGameBalance).toFixed(2) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : null
      };
    },
    
    async loadTransactions() {
      try {
        console.log('Loading transactions...');
        this.loading = true;
        
        const transactionsRef = collection(this.db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', this.user.uid),
          orderBy('dateTime', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log('Fetched transactions count:', querySnapshot.docs.length);
        
        // Clear existing transactions
        this.transactions = [];
        
        // Process each transaction
        querySnapshot.docs.forEach(doc => {
          const formattedTransaction = this.formatTransaction(doc.id, doc.data());
          this.transactions.push(formattedTransaction);
        });
        
        // Sort transactions
        this.transactions.sort((a, b) => b.dateTime - a.dateTime);
        console.log('Transactions loaded:', this.transactions.length);
      } catch (error) {
        console.error('Error loading transactions:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
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
    async handleDeposit() {
      if (this.depositAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (!this.user) {
        alert('User not authenticated. Please log in.');
        return;
      }

      // PayMongo public key for demo
      const PAYMONGO_PUBLIC_KEY = 'pk_test_CseY8QUggCjWn5FWk71y3FTd';

      try {
        // 1. Create a pending transaction in Firestore
        const transactionsRef = collection(this.db, 'transactions');
        const transactionData = {
          userId: this.user.uid,
          email: this.user.email,
          type: 'credit', // It's a credit to the user's wallet
          amount: Number(this.depositAmount), // Store as number
          status: 'Pending', // Initial status
          title: 'Money Deposit',
          description: `Pending deposit of ₱${Number(this.depositAmount).toFixed(2)} to wallet`,
          dateTime: serverTimestamp(),
          reference: `#DEPOSIT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, // Unique reference
          paymentMethod: 'gcash' // Assuming GCash for this flow based on your PayMongo code
        };

        const transactionRef = await addDoc(transactionsRef, transactionData);
        console.log('Pending deposit transaction created with ID:', transactionRef.id);

        const response = await fetch('https://api.paymongo.com/v1/sources', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(PAYMONGO_PUBLIC_KEY + ':'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              attributes: {
                amount: this.depositAmount * 100, // centavos
                redirect: {
                  success: `${window.location.origin}/deposit-success?transactionId=${transactionRef.id}&userId=${this.user.uid}`,
                  failed: `${window.location.origin}/deposit-failed?transactionId=${transactionRef.id}&userId=${this.user.uid}`
                },
                type: 'gcash', // or 'grab_pay'
                currency: 'PHP'
              }
            }
          })
        });

        const result = await response.json();

        if (result.data && result.data.attributes && result.data.attributes.redirect) {
          // Redirect user to PayMongo checkout
          localStorage.setItem('pendingDepositAmount', this.depositAmount);
          window.location.href = result.data.attributes.redirect.checkout_url;
        } else {
          alert('Failed to create payment source: ' + (result.errors ? result.errors[0].detail : 'Unknown error'));
          // Optionally update the pending transaction status to Failed here as well
          if (transactionRef && transactionRef.id) {
            await updateDoc(transactionRef, { status: 'Failed', description: 'Payment source creation failed.' });
          }
        }
      } catch (error) {
        alert('Error creating payment: ' + error.message);
        // Optionally update the pending transaction status to Failed here as well
        if (transactionRef && transactionRef.id) {
          await updateDoc(transactionRef, { status: 'Failed', description: 'Payment source creation failed.' });
        }
      }
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

      const newWalletBalance = Number(this.walletBalance) - Number(this.sendAmount);
      
      this.addTransaction(this.sendAmount, 'Transaction Complete', 'Send', {
        newWalletBalance: newWalletBalance,
        previousWalletBalance: this.walletBalance,
        recipientAddress: this.recipientAddress
      }).then(() => {
        this.walletBalance = newWalletBalance;
        this.showSendModal = false;
        this.sendAmount = 0;
        this.recipientAddress = '';
        this.transactionSuccessMessage = 'Your send transaction was successful!';
        this.showTransactionSuccessModal = true;
      }).catch(error => {
        console.error('Error processing send:', error);
        alert('Error processing send. Please try again.');
      });
    },
    async handleExchange() {
      if (this.exchangeAmount <= 0) {
        this.errorMessage = 'Please enter a valid amount';
        return;
      }

      this.isProcessing = true;
      try {
        if (!this.user) {
          throw new Error('User not authenticated');
        }

        const db = getFirestore(app);
        let success = false;
        let newWalletBalance = this.walletBalance;
        let newGameBalance = this.gameBalance;

        if (this.exchangeDirection === 'walletToTokens') {
          // 1 PHP = 10 tokens
          if (this.exchangeAmount > this.walletBalance) {
            this.errorMessage = 'Insufficient wallet balance';
            return;
          }
          const tokensToAdd = Number(this.exchangeAmount) * 10;
          newWalletBalance = Number(this.walletBalance) - Number(this.exchangeAmount);
          newGameBalance = Number(this.gameBalance) + tokensToAdd;
          success = true;
        } else {
          // 10 tokens = 1 PHP
          const tokensToConvert = Number(this.exchangeAmount);
          if (tokensToConvert > this.gameBalance) {
            this.errorMessage = 'Insufficient token balance';
            return;
          }
          if (tokensToConvert % 10 !== 0) {
            this.errorMessage = 'You can only convert in multiples of 10 tokens.';
            return;
          }
          const phpAmount = tokensToConvert / 10;
          newGameBalance = Number(this.gameBalance) - tokensToConvert;
          newWalletBalance = Number(this.walletBalance) + phpAmount;
          this.exchangePhpAmount = phpAmount; // Store for transaction record
          success = true;
        }

        if (success) {
          console.log('Processing exchange transaction...');
          console.log('Current balances - Wallet:', this.walletBalance, 'Game:', this.gameBalance);
          console.log('New balances - Wallet:', newWalletBalance, 'Game:', newGameBalance);

          // Create transaction data
          const transactionData = {
            userId: this.user.uid,
            email: this.user.email,
            type: this.exchangeDirection === 'walletToTokens' ? 'debit' : 'credit',
            amount: this.exchangeDirection === 'walletToTokens'
              ? Number(this.exchangeAmount).toFixed(2)
              : Number(this.exchangePhpAmount).toFixed(2),
            status: 'Transaction Complete',
            title: 'Exchange Transaction',
            description: this.exchangeDirection === 'walletToTokens'
              ? `Exchanged ₱${this.exchangeAmount} from wallet to $ASH`
              : `Exchanged $ASH ${this.exchangeAmount} to ₱${this.exchangePhpAmount} in wallet`,
            dateTime: serverTimestamp(),
            reference: `#EXCH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            exchangeDirection: this.exchangeDirection,
            walletBalance: newWalletBalance,
            gameBalance: newGameBalance,
            previousWalletBalance: this.walletBalance,
            previousGameBalance: this.gameBalance
          };

          console.log('Creating transaction record in Firestore');

          // Add transaction to Firestore
          const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
          console.log('Transaction added with ID:', transactionRef.id);

          // Update user's balances in Firestore
          const userRef = doc(db, "users", this.user.uid);
          await updateDoc(userRef, {
            walletBalance: newWalletBalance,
            gameBalance: newGameBalance,
            lastTransaction: serverTimestamp()
          });
          console.log('User balances updated in Firestore');

          // Update local state
          this.walletBalance = newWalletBalance;
          this.gameBalance = newGameBalance;

          // Add transaction to local array immediately for instant UI update
          const newTransaction = {
            id: transactionRef.id,
            ...transactionData,
            dateTime: new Date(),
            formattedDateTime: this.formatDateTime(new Date()),
            amount: Number(transactionData.amount).toFixed(2),
            walletBalance: Number(transactionData.walletBalance).toFixed(2),
            gameBalance: Number(transactionData.gameBalance).toFixed(2),
            previousWalletBalance: transactionData.previousWalletBalance ? Number(transactionData.previousWalletBalance).toFixed(2) : null,
            previousGameBalance: transactionData.previousGameBalance ? Number(transactionData.previousGameBalance).toFixed(2) : null,
            expiryDate: transactionData.expiryDate ? new Date(transactionData.expiryDate).toLocaleDateString() : null
          };
          
          // Add to the beginning of the array
          this.transactions.unshift(newTransaction);
          console.log('Transaction added to local array');

          // Explicitly reload transactions to ensure consistency
          await this.loadTransactions();
          console.log('Transactions reloaded');

          // Close modal and reset form
          this.showExchangeModal = false;
          this.exchangeAmount = 0;
          this.errorMessage = '';

          // Show success message
          this.transactionSuccessMessage = 'Exchange completed successfully!';
          this.showTransactionSuccessModal = true;
        }
      } catch (error) {
        console.error('Error processing exchange:', error);
        this.transactionSuccessMessage = 'Error processing exchange. Please try again.';
        this.showTransactionSuccessModal = true;
      } finally {
        this.isProcessing = false;
      }
    },
    async updateGameBalance(newBalance) {
      this.gameBalance = newBalance;
      
      // Update Firestore with new game balance
      if (this.user) {
        const userRef = doc(this.db, "users", this.user.uid);
        await updateDoc(userRef, {
          gameBalance: this.gameBalance
        });
      }
    },
    openPaymentMethodModal() {
      this.showPaymentMethodModal = true;
    },
    closePaymentMethodModal() {
      this.showPaymentMethodModal = false;
      this.errorMessage = '';
    },
    closeMembershipModal() {
      this.showMembershipModal = false;
      this.selectedMembership = null;
      this.isProcessing = false;
      this.showPaymentMethodModal = false;
      this.errorMessage = '';
    },
    async handleMembershipPayment() {
      if (!this.selectedMembership) {
        this.errorMessage = 'Please select a membership plan';
        return;
      }

      // Check if user has an active membership
      if (this.userData && this.userData.membershipExpiry) {
        const expiry = this.userData.membershipExpiry.toDate();
        const now = new Date();
        if (expiry > now) {
          const formattedExpiry = expiry.toLocaleDateString();
          this.errorMessage = `You already have an active ${this.userData.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix'} membership until ${formattedExpiry}. Please wait for it to expire before purchasing a new membership.`;
          return;
        }
      }

      const phpAmount = this.membershipPrices[this.selectedMembership];
      const paymentType = this.selectedMembership === 'fullYear' ? 'fullYear' : 'semestral';

      // Calculate amount based on payment method ($ASH requires 10x the PHP amount)
      const amount = this.selectedPaymentMethod === 'tokens' ? phpAmount * 10 : phpAmount;

      // Check selected payment method balance
      if (this.selectedPaymentMethod === 'wallet' && phpAmount > this.walletBalance) {
        this.errorMessage = 'Insufficient wallet balance';
        return;
      }
      if (this.selectedPaymentMethod === 'tokens' && amount > this.gameBalance) {
        this.errorMessage = 'Insufficient $ASH balance';
        return;
      }
      this.errorMessage = '';
      this.isProcessing = true;

      try {
        // Calculate new balances
        let newWalletBalance = this.walletBalance;
        let newGameBalance = this.gameBalance;
        
        if (this.selectedPaymentMethod === 'wallet') {
          newWalletBalance = Number(this.walletBalance) - phpAmount;
        } else {
          newGameBalance = Number(this.gameBalance) - amount; // Deduct the $ASH amount (10x PHP)
        }

        // Calculate membership expiry
        const expiryDate = this.calculateMembershipExpiry(this.selectedMembership);
        const { Timestamp } = await import('firebase/firestore');
        const expiryTimestamp = Timestamp.fromDate(expiryDate);

        // Record the transaction in Firestore
        const transactionData = {
          userId: this.user.uid,
          email: this.user.email,
          type: 'debit',
          amount: this.selectedPaymentMethod === 'tokens' ? amount : phpAmount,
          status: 'Transaction Complete',
          title: 'Membership Payment',
          description: `Membership payment of ${this.selectedPaymentMethod === 'tokens' ? amount + ' $ASH' : '₱' + phpAmount} for ${this.selectedMembership} plan (Valid until ${expiryDate.toLocaleDateString()})`,
          dateTime: serverTimestamp(),
          reference: `#MEMB-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          membershipType: this.selectedMembership,
          expiryDate: expiryTimestamp,
          paymentMethod: this.selectedPaymentMethod,
          walletBalance: newWalletBalance,
          gameBalance: newGameBalance,
          previousWalletBalance: this.walletBalance,
          previousGameBalance: this.gameBalance
        };

        // Add transaction to Firestore
        await addDoc(collection(this.db, 'transactions'), transactionData);

        // Update user's membership status and balances in Firestore
        const userRef = doc(this.db, "users", this.user.uid);
        await updateDoc(userRef, {
          membershipType: this.selectedMembership,
          membershipExpiry: expiryTimestamp,
          lastMembershipPayment: serverTimestamp(),
          walletBalance: newWalletBalance,
          gameBalance: newGameBalance,
          isPaid: true,
          paymentType: paymentType
        });

        // Update local state
        this.walletBalance = newWalletBalance;
        this.gameBalance = newGameBalance;
        this.showMembershipModal = false;
        this.selectedMembership = null;
        this.selectedPaymentMethod = 'wallet';
        this.showPaymentMethodModal = false;

        // Show success message
        this.transactionSuccessMessage = `Membership payment successful! Paid with ${this.selectedPaymentMethod === 'tokens' ? amount + ' $ASH' : '₱' + phpAmount}`;
        this.showTransactionSuccessModal = true;

        // Increment the admin wallet
        const walletRef = doc(this.db, 'admin_wallet', 'main');
        // Ensure the wallet exists
        const walletDoc = await getDoc(walletRef);
        if (!walletDoc.exists()) {
          await setDoc(walletRef, { balance: 0 });
        }
        // Increment the balance
        await updateDoc(walletRef, {
          balance: increment(phpAmount) // phpAmount is the membership price (e.g., 50 or 100)
        });
      } catch (error) {
        console.error('Error processing membership payment:', error);
        this.errorMessage = 'Error processing payment. Please try again.';
      } finally {
        this.isProcessing = false;
      }
    },
    calculateMembershipExpiry(membershipType) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0 = Jan, 7 = Aug, 11 = Dec

      if (membershipType === 'fullYear') {
        // If paid between June and December, next expiry is May 31 of the next year
        // If paid between January and May, expiry is May 31 of the same year
        let expiryYear;
        if (month >= 5) { // June (5) or later
          expiryYear = year + 1;
        } else {
          expiryYear = year;
        }
        // Full year covers up to May 31 of the next year
        return new Date(expiryYear, 4, 31, 23, 59, 59, 999); // May is month 4
      } else if (membershipType === 'semester') {
        // If paid between June and December, expiry is Dec 31 of this year
        // If paid between January and May, expiry is May 31 of this year
        if (month >= 5 && month <= 11) { // June to December
          return new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31
        } else {
          return new Date(year, 4, 31, 23, 59, 59, 999); // May 31
        }
      }
      // fallback
      return now;
    },
    async addTransaction(amount, status, type, additionalData = {}) {
      try {
        if (!this.user) {
          throw new Error('User not authenticated');
        }

        const db = getFirestore(app);
        // Format amount to 2 decimal places
        const formattedAmount = Number(amount).toFixed(2);
        
        // Generate a unique reference number
        const referenceNumber = `#${type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        
        // Determine transaction type and description
        let transactionType = type.toLowerCase();
        let description = '';
        
        switch(type) {
          case 'Deposit':
            transactionType = 'credit';
            description = `Deposit of ₱${formattedAmount} to wallet`;
            break;
          case 'Send':
            transactionType = 'debit';
            description = `Sent ₱${formattedAmount} to ${this.recipientAddress}`;
            break;
          case 'Exchange':
            transactionType = additionalData.exchangeDirection === 'walletToTokens' ? 'debit' : 'credit';
            description = additionalData.exchangeDirection === 'walletToTokens' 
              ? `Exchanged ₱${formattedAmount} from wallet to game tokens`
              : `Exchanged ₱${formattedAmount} from game tokens to wallet`;
            break;
          case 'Membership':
            transactionType = 'debit';
            const membershipType = additionalData.membershipType || this.selectedMembership;
            const expiryDate = additionalData.expiryDate 
              ? new Date(additionalData.expiryDate).toLocaleDateString()
              : this.calculateMembershipExpiry(membershipType).toLocaleDateString();
            description = `Membership payment of ₱${formattedAmount} for ${membershipType} plan (Valid until ${expiryDate})`;
            break;
          default:
            description = `${type} transaction of ₱${formattedAmount}`;
        }
        
        // Create transaction record with enhanced metadata
        const transactionData = {
          userId: this.user.uid,
          email: this.user.email,
          type: transactionType,
          amount: formattedAmount,
          status: status,
          title: `${type} Transaction`,
          description: description,
          dateTime: serverTimestamp(),
          reference: referenceNumber,
          recipientAddress: this.recipientAddress || null,
          exchangeDirection: type === 'Exchange' ? additionalData.exchangeDirection : null,
          membershipType: type === 'Membership' ? (additionalData.membershipType || this.selectedMembership) : null,
          walletBalance: additionalData.newWalletBalance || this.walletBalance,
          gameBalance: additionalData.newGameBalance || this.gameBalance,
          previousWalletBalance: additionalData.previousWalletBalance || null,
          previousGameBalance: additionalData.previousGameBalance || null,
          expiryDate: additionalData.expiryDate || null,
          transactionDetails: {
            type: type,
            direction: additionalData.exchangeDirection,
            membershipType: this.selectedMembership,
            recipient: this.recipientAddress
          }
        };

        console.log('Creating transaction record in Firestore via addTransaction');

        // Add transaction to Firestore
        const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
        console.log('Transaction added with ID:', transactionRef.id);

        // Add transaction to local array immediately for instant UI update
        const newTransaction = {
          id: transactionRef.id,
          ...transactionData,
          dateTime: new Date(),
          formattedDateTime: this.formatDateTime(new Date()),
          amount: Number(transactionData.amount).toFixed(2),
          walletBalance: Number(transactionData.walletBalance || 0).toFixed(2),
          gameBalance: Number(transactionData.gameBalance || 0).toFixed(2),
          previousWalletBalance: transactionData.previousWalletBalance ? Number(transactionData.previousWalletBalance).toFixed(2) : null,
          previousGameBalance: transactionData.previousGameBalance ? Number(transactionData.previousGameBalance).toFixed(2) : null,
          expiryDate: transactionData.expiryDate ? new Date(transactionData.expiryDate).toLocaleDateString() : null
        };
        
        // Add to the beginning of the array
        this.transactions.unshift(newTransaction);
        console.log('Transaction added to local array via addTransaction');

        // Explicitly reload transactions to ensure consistency
        await this.loadTransactions();
        console.log('Transactions reloaded via addTransaction');

        // Show success message
        this.transactionSuccessMessage = `${type} transaction completed successfully!`;
        this.showTransactionSuccessModal = true;

        return transactionRef;

      } catch (error) {
        console.error('Error adding transaction:', error);
        this.transactionSuccessMessage = 'Error recording transaction. Please try again.';
        this.showTransactionSuccessModal = true;
        throw error;
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
    },
  },
  mounted() {
    this.initializeButtonEffects();
    
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false;
      }
    });

    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  beforeUnmount() {
    console.log('Component unmounting, cleaning up resources...');
    clearInterval(this.timer);
    
    if (this.transactionListener) {
      console.log('Cleaning up transaction listener');
      this.transactionListener();
      this.transactionListener = null;
    }
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

.current-datetime {
  position: absolute;
  top: 24px;
  right: 32px;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #ff6a00;
  font-weight: 500;
  letter-spacing: 0.5px;
  background: rgba(255,255,255,0.85);
  padding: 6px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  z-index: 10;
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

/* Responsive Design */
@media screen and (max-width: 1200px) {
  .container {
    grid-template-columns: 60px 1fr;
  }
  
  #sidebar {
    width: 60px;
    transform: translateX(0);
  }
  
  main {
    left: 60px;
    width: calc(100vw - 60px);
    margin-left: 0;
  }

  .sidebar-nav h3 {
    display: none;
  }

  .logo img {
    width: 40px;
    height: 40px;
    margin: 0;
  }

  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .card {
    padding: 20px;
  }

  .admin-wallet-card h1 {
    font-size: 2rem;
  }

  .elite-card h1 {
    font-size: 1.75rem;
  }
}

@media screen and (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
  
  #sidebar {
    transform: translateX(-100%);
    width: 280px;
    z-index: 1000;
  }
  
  #sidebar.show {
    transform: translateX(0);
  }
  
  main {
    left: 0;
    width: 100%;
    margin-left: 0;
    padding: 0 16px 16px 16px;
    margin-top: 0; /* Ensure no top margin */
  }

  .sidebar-nav h3 {
    display: inline;
  }

  .logo img {
    width: 80%;
    height: auto;
  }

  .close-btn {
    display: block;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-header {
    padding: 0 0 8px 0; /* Remove top padding */
    margin: 0 0 16px 0; /* Remove top margin */
    position: relative;
  }

  .main-header h1 {
    text-align: left;
    margin-left: 8px;
    font-size: 1.5rem;
  }

  .current-datetime {
    display: none;
  }

  .admin-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }

  .table-wrapper {
    margin: 0 -16px;
    border-radius: 0;
    overflow-x: auto;
  }

  th, td {
    padding: 12px;
    white-space: nowrap;
  }

  .modal-content {
    width: 95%;
    max-width: none;
    margin: 16px;
    padding: 20px;
  }

  .detail-group .modal-card-box {
    max-width: 100%;
  }
}

@media screen and (max-width: 480px) {
  main {
    padding: 0 12px 12px 12px;
    margin-top: 0; /* Ensure no top margin */
  }

  .main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 0 0 4px 0; /* Remove top padding */
    margin: 0 0 12px 0; /* Remove top margin */
  }

  .main-header h1 {
    font-size: 1.25rem;
    margin-left: 0;
  }

  .card {
    padding: 16px;
  }

  .admin-wallet-card h1 {
    font-size: 1.5rem;
  }

  .admin-wallet-card h3 {
    font-size: 0.9rem;
  }

  .elite-card h1 {
    font-size: 1.5rem;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .material-icons {
    font-size: 18px;
  }

  .table-wrapper {
    margin: 0 -12px;
  }

  th, td {
    padding: 8px;
    font-size: 0.9rem;
  }

  .modal-content {
    padding: 16px;
    margin: 12px;
  }

  .detail-group label {
    font-size: 0.85rem;
  }

  .detail-group p {
    font-size: 0.9rem;
  }
}

/* Add smooth transitions for all responsive changes */
#sidebar,
main,
.main-header,
.admin-stats,
.card,
.table-wrapper,
.modal-content {
  transition: all 0.3s ease-in-out;
}

/* Ensure modals are always responsive */
.modal {
  padding: 16px;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Improve table responsiveness */
.table-wrapper {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--color-light);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 3px;
}

/* Ensure buttons remain clickable on mobile */
button,
.action-btn,
.icon-btn {
  min-height: 44px;
  min-width: 44px;
}

/* Improve form element touch targets */
input,
select,
textarea {
  min-height: 44px;
  font-size: 16px; /* Prevents iOS zoom on focus */
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

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--color-dark-variant);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 6px;
  margin: 4px 10px;
}

.nav-link:hover {
  background-color: var(--color-light);
}

.nav-link.router-link-active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.nav-link .material-icons {
  margin-right: 10px;
}

.exchange-modal-box {
  background: #fff8f2;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(255,106,0,0.10);
  padding: 32px 28px 24px 28px;
  max-width: 400px;
  width: 95%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.exchange-modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #ff6a00 0%, #ff9800 100%);
  border-radius: 12px 12px 0 0;
  padding: 16px 0 12px 0;
  margin: -32px -28px 18px -28px;
  box-shadow: 0 2px 8px rgba(255,106,0,0.07);
}
.conversion-rate-info {
  margin-bottom: 18px;
  text-align: center;
  color: #ff6a00;
  font-weight: 600;
  font-size: 1.05rem;
  background: rgba(255,106,0,0.07);
  border-radius: 8px;
  padding: 10px 0;
  letter-spacing: 0.2px;
}
.exchange-input, .exchange-select {
  border: 1.5px solid #ffb366;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 1rem;
  background: #fff;
  margin-top: 4px;
  margin-bottom: 2px;
  transition: border-color 0.2s;
}
.exchange-input:focus, .exchange-select:focus {
  border-color: #ff6a00;
  outline: none;
}
@media (max-width: 540px) {
  .exchange-modal-box {
    padding: 18px 6px 12px 6px;
    max-width: 98vw;
  }
  .exchange-modal-header {
    margin: -18px -6px 12px -6px;
    padding: 10px 0 8px 0;
  }
}
.membership-option.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.05);
}

.membership-active-notice {
  color: #ff6a00;
  font-size: 0.8rem;
  margin-top: 8px;
  font-weight: 500;
}

.membership-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 106, 0, 0.1);
  color: #ff6a00;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 0.9rem;
}

.membership-warning .material-icons {
  font-size: 20px;
}
</style>