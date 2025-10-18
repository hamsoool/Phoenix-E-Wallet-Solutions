<template>
  <div>
    <!-- Add Transaction Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Transaction Details</h3>
          <button class="close-modal-btn" @click="closeDetailsModal">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="receipt-container">
          <div class="receipt-header">
            <img src="../assets/images/newlogo.png" alt="Phoenix Logo" class="receipt-logo">
            <h4>Transaction Receipt</h4>
          </div>
          <div class="receipt-body">
            <div class="receipt-row">
              <span class="label">Transaction ID:</span>
              <span class="value">{{ selectedTransaction?.reference }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Date & Time:</span>
              <span class="value">{{ selectedTransaction?.formattedDateTime }}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Type:</span>
              <span class="value" :class="selectedTransaction?.type">
                {{ selectedTransaction?.type === 'credit' ? 'Credit' : 'Debit' }}
              </span>
            </div>
            <div class="receipt-row">
              <span class="label">Amount:</span>
              <span class="value" :class="selectedTransaction?.type">
                <template v-if="selectedTransaction?.paymentMethod === 'tokens'">
                  {{ selectedTransaction?.type === 'credit' ? '+' : '-' }}$ASH {{ selectedTransaction?.amount }}
                </template>
                <template v-else>
                  {{ selectedTransaction?.type === 'credit' ? '+' : '-' }}₱{{ selectedTransaction?.amount }}
                </template>
              </span>
            </div>
            <div class="receipt-row">
              <span class="label">Status:</span>
              <span class="value status-badge" :class="selectedTransaction?.status.toLowerCase()">
                {{ selectedTransaction?.status }}
              </span>
            </div>
            <div class="receipt-row" v-if="selectedTransaction?.recipientAddress">
              <span class="label">Recipient:</span>
              <span class="value">{{ selectedTransaction?.recipientAddress }}</span>
            </div>
          </div>
          <div class="receipt-footer">
            <p>Thank you for using Phoenix E-Wallet!</p>
            <p class="receipt-id">Receipt #{{ selectedTransaction?.id }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="history-container">
      <div class="history-header">
        <h2>Transaction History</h2>
        <div class="history-controls">
          <div class="filter-controls">
            <select v-model="selectedFilter" class="filter-select">
              <option value="all">All Transactions</option>
              <option value="transaction complete">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Search transactions..." 
              class="search-input"
            >
          </div>
          <button @click="refreshTransactions" class="refresh-button">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="refreshTransactions" class="retry-button">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="transactions.length === 0" class="empty-state">
        <i class="fas fa-history"></i>
        <p>No transactions found</p>
      </div>

      <!-- Transactions Table -->
      <div v-else class="transactions-table-container">
        <table class="transactions-table">
          <thead>
            <tr>
              <th @click="changeSort('dateTime')" class="sortable">
                Date/Time
                <i :class="['fas', sortBy === 'dateTime' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort']"></i>
              </th>
              <th @click="changeSort('title')" class="sortable">
                Title
                <i :class="['fas', sortBy === 'title' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort']"></i>
              </th>
              <th @click="changeSort('amount')" class="sortable">
                Amount
                <i :class="['fas', sortBy === 'amount' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort']"></i>
              </th>
              <th @click="changeSort('status')" class="sortable">
                Status
                <i :class="['fas', sortBy === 'status' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort']"></i>
              </th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-row">
              <td>{{ transaction.formattedDateTime }}</td>
              <td>{{ transaction.title }}</td>
              <td :class="transaction.type === 'credit' ? 'credit' : 'debit'">
                <template v-if="transaction.paymentMethod === 'tokens'">
                  {{ transaction.type === 'credit' ? '+' : '-' }}$ASH {{ transaction.amount }}
                </template>
                <template v-else>
                  {{ transaction.type === 'credit' ? '+' : '-' }}₱{{ transaction.amount }}
                </template>
              </td>
              <td>
                <span :class="['status-badge', transaction.status.toLowerCase()]">
                  {{ transaction.status }}
                </span>
              </td>
              <td>
                <button @click="showTransactionDetails(transaction)" class="details-button">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <button 
          v-for="page in paginationRange" 
          :key="page"
          @click="currentPage = page"
          :class="['pagination-button', { active: currentPage === page }]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

export default {
  name: 'HistoryComponent',
  data() {
    return {
      selectedFilter: 'all',
      searchTerm: '',
      currentPage: 1,
      pageSize: 10,
      loading: true,
      error: null,
      sortBy: 'dateTime',
      sortDirection: 'desc',
      transactions: [],
      transactionListener: null,
      showDetailsModal: false,
      selectedTransaction: null
    };
  },
  computed: {
    filteredTransactions() {
      let filtered = [...this.transactions];
      
      // Apply status filter
      if (this.selectedFilter !== 'all') {
        filtered = filtered.filter(transaction => 
          transaction.status.toLowerCase() === this.selectedFilter);
      }
      
      // Apply search filter
      if (this.searchTerm.trim() !== '') {
        const searchLower = this.searchTerm.toLowerCase();
        filtered = filtered.filter(transaction => 
          transaction.title.toLowerCase().includes(searchLower) ||
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.reference.toLowerCase().includes(searchLower) ||
          (transaction.recipientAddress && transaction.recipientAddress.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aValue = a[this.sortBy];
        let bValue = b[this.sortBy];
        
        // Handle timestamp objects
        if (this.sortBy === 'dateTime') {
          aValue = aValue?.toDate?.() || new Date(aValue);
          bValue = bValue?.toDate?.() || new Date(bValue);
        }
        
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Apply pagination
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return filtered.slice(start, end);
    },
    totalPages() {
      const filtered = this.transactions.filter(transaction => {
        if (this.selectedFilter !== 'all') {
          return transaction.status.toLowerCase() === this.selectedFilter;
        }
        return true;
      });
      
      if (this.searchTerm.trim() !== '') {
        const searchLower = this.searchTerm.toLowerCase();
        return Math.ceil(filtered.filter(transaction => 
          transaction.title.toLowerCase().includes(searchLower) ||
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.reference.toLowerCase().includes(searchLower) ||
          (transaction.recipientAddress && transaction.recipientAddress.toLowerCase().includes(searchLower))
        ).length / this.pageSize);
      }
      
      return Math.ceil(filtered.length / this.pageSize);
    },
    paginationRange() {
      const total = this.totalPages;
      const current = this.currentPage;
      const range = [];
      
      // Always show first page
      range.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, current + 1);
      
      // Add ellipsis if needed
      if (start > 2) range.push('...');
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      // Add ellipsis if needed
      if (end < total - 1) range.push('...');
      
      // Always show last page if there is more than one page
      if (total > 1) range.push(total);
      
      return range;
    }
  },
  methods: {
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
    changeSort(field) {
      if (this.sortBy === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = field;
        this.sortDirection = 'desc';
      }
    },
    async loadTransactions() {
      try {
        this.loading = true;
        console.log('Loading transactions in History component...');
        
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user) {
          console.log('No user found, skipping transaction fetch');
          return;
        }
        
        const db = getFirestore(app);
        const transactionsRef = collection(db, 'transactions');
        
        // Query transactions for the current user, ordered by date
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid),
          orderBy('dateTime', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        console.log('Fetched transactions count:', querySnapshot.docs.length);
        
        // Clear existing transactions
        this.transactions = [];
        
        // Process each transaction
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          let dateTime;
          if (data.dateTime && typeof data.dateTime.toDate === 'function') {
            dateTime = data.dateTime.toDate();
          } else if (data.dateTime instanceof Date) {
            dateTime = data.dateTime;
          } else {
            dateTime = new Date();
          }
          
          const transaction = {
            id: doc.id,
            ...data,
            dateTime: dateTime,
            formattedDateTime: this.formatDateTime(dateTime),
            amount: Number(data.amount).toFixed(2),
            walletBalance: Number(data.walletBalance || 0).toFixed(2),
            gameBalance: Number(data.gameBalance || 0).toFixed(2),
            previousWalletBalance: data.previousWalletBalance ? Number(data.previousWalletBalance).toFixed(2) : null,
            previousGameBalance: data.previousGameBalance ? Number(data.previousGameBalance).toFixed(2) : null,
            expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : null
          };
          
          this.transactions.push(transaction);
        });
        
        // Sort transactions by dateTime descending
        this.transactions.sort((a, b) => b.dateTime - a.dateTime);
        console.log('Transactions loaded in History component:', this.transactions.length);
        
      } catch (error) {
        console.error('Error loading transactions in History component:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    setupTransactionListener() {
      try {
        console.log('Setting up transaction listener in History component');
        
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user) {
          console.log('No user found, skipping transaction listener setup');
          return;
        }
        
        const db = getFirestore(app);
        const transactionsRef = collection(db, 'transactions');
        
        // Query for user's transactions
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid),
          orderBy('dateTime', 'desc')
        );
        
        console.log('Creating snapshot listener in History component');
        this.transactionListener = onSnapshot(q, (snapshot) => {
          console.log('Transaction snapshot received in History component:', snapshot.docs.length, 'documents');
          
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            let dateTime;
            if (data.dateTime && typeof data.dateTime.toDate === 'function') {
              dateTime = data.dateTime.toDate();
            } else if (data.dateTime instanceof Date) {
              dateTime = data.dateTime;
            } else {
              dateTime = new Date();
            }
            
            const transaction = {
              id: change.doc.id,
              ...data,
              dateTime: dateTime,
              formattedDateTime: this.formatDateTime(dateTime),
              amount: Number(data.amount).toFixed(2),
              walletBalance: Number(data.walletBalance || 0).toFixed(2),
              gameBalance: Number(data.gameBalance || 0).toFixed(2),
              previousWalletBalance: data.previousWalletBalance ? Number(data.previousWalletBalance).toFixed(2) : null,
              previousGameBalance: data.previousGameBalance ? Number(data.previousGameBalance).toFixed(2) : null,
              expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : null
            };
            
            if (change.type === 'added') {
              console.log('Transaction added in History component:', transaction.id);
              // Check if transaction already exists
              const existingIndex = this.transactions.findIndex(t => t.id === transaction.id);
              if (existingIndex === -1) {
                this.transactions.unshift(transaction);
              }
            } else if (change.type === 'modified') {
              console.log('Transaction modified in History component:', transaction.id);
              // Update existing transaction
              const index = this.transactions.findIndex(t => t.id === transaction.id);
              if (index !== -1) {
                this.transactions.splice(index, 1, transaction);
              }
            } else if (change.type === 'removed') {
              console.log('Transaction removed in History component:', transaction.id);
              // Remove transaction
              const index = this.transactions.findIndex(t => t.id === transaction.id);
              if (index !== -1) {
                this.transactions.splice(index, 1);
              }
            }
          });
          
          // Sort transactions by dateTime descending
          this.transactions.sort((a, b) => b.dateTime - a.dateTime);
          console.log('Updated transactions array in History component:', this.transactions.length);
        }, (error) => {
          console.error('Error in transaction listener in History component:', error);
        });
        
        console.log('Transaction listener setup complete in History component');
      } catch (error) {
        console.error('Error setting up transaction listener in History component:', error);
      }
    },
    refreshTransactions() {
      this.loadTransactions();
    },
    showTransactionDetails(transaction) {
      this.selectedTransaction = transaction;
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedTransaction = null;
    }
  },
  watch: {
    transactions: {
      handler() {
        // Reset to first page when transactions change
        this.currentPage = 1;
      },
      deep: true
    },
    selectedFilter() {
      this.currentPage = 1;
    },
    searchTerm() {
      this.currentPage = 1;
    }
  },
  async created() {
    try {
      console.log('History component created');
      await this.loadTransactions();
      this.setupTransactionListener();
    } catch (error) {
      console.error('Error in History component created hook:', error);
    }
  },
  beforeUnmount() {
    console.log('History component unmounting, cleaning up resources...');
    if (this.transactionListener) {
      console.log('Cleaning up transaction listener in History component');
      this.transactionListener();
      this.transactionListener = null;
    }
  }
};
</script>

<style scoped>
/* History Specific Styles */
.history-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-select,
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.refresh-button {
  padding: 8px 15px;
  background: #ff6a00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.refresh-button:hover {
  background: #e65c00;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state i {
  color: #dc3545;
  font-size: 24px;
  margin-bottom: 10px;
}

.retry-button {
  margin-top: 10px;
  padding: 8px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state i {
  font-size: 24px;
  margin-bottom: 10px;
  color: #6c757d;
}

.transactions-table-container {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.transactions-table th,
.transactions-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.transactions-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: #e9ecef;
}

.transaction-row:hover {
  background: #f8f9fa;
}

.credit {
  color: #28a745;
}

.debit {
  color: #dc3545;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.transaction\ complete {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.details-button {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.details-button:hover {
  background: #5a6268;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 20px;
}

.pagination-button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination-button:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.pagination-button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-button:not(:disabled):hover {
  background: #e9ecef;
}

.pagination-button.active:hover {
  background: #0056b3;
}

/* Modal Styles */
.modal-overlay {
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
  background-color: #f8f9fa;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #343a40;
  font-size: 1.25rem;
}

.close-modal-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
}

.close-modal-btn:hover {
  color: #343a40;
}

/* Receipt Styles */
.receipt-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.receipt-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #dee2e6;
}

.receipt-logo {
  width: 80px;
  height: auto;
  margin-bottom: 10px;
}

.receipt-header h4 {
  margin: 0;
  color: #343a40;
  font-size: 1.1rem;
}

.receipt-body {
  margin-bottom: 20px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.receipt-row .label {
  color: #6c757d;
  font-weight: 500;
}

.receipt-row .value {
  color: #343a40;
  font-weight: 500;
}

.receipt-row .value.credit {
  color: #28a745;
}

.receipt-row .value.debit {
  color: #dc3545;
}

.receipt-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px dashed #dee2e6;
  color: #6c757d;
  font-size: 0.9rem;
}

.receipt-id {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #adb5bd;
}

/* Status badge styles in modal */
.receipt-row .status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.receipt-row .status-badge.transaction\ complete {
  background: #d4edda;
  color: #155724;
}

.receipt-row .status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.receipt-row .status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

@media screen and (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .receipt-container {
    margin: 10px;
    padding: 15px;
  }

  .receipt-row {
    font-size: 0.9rem;
  }
}
</style>