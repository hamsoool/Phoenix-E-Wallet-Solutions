<template>
  <div>
   

    <div class="history-container">
      <!-- Transactions Panel -->
      <div class="transaction-panel">
        <div class="panel-header">
          <h2>Recent Transactions</h2>
          <div class="filter-controls">
            <select class="filter-select" v-model="selectedFilter">
              <option value="all">All Transactions</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input type="search" class="search-input" placeholder="Search..." v-model="searchTerm">
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <span class="material-icons loading-icon">sync</span>
          <p>Loading transactions...</p>
        </div>

        <!-- No Transactions Found -->
        <div v-else-if="filteredTransactions.length === 0" class="no-transactions">
          <span class="material-icons">receipt_long</span>
          <p>No Transactions Found</p>
          <p class="sub-text">Your transaction history will appear here</p>
        </div>

        <!-- Transactions Table -->
        <table v-else class="transaction-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Amount</th>
              <th>Date & Time</th>
              <th>Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(transaction, index) in filteredTransactions" :key="transaction.id">
              <td>
                <div class="transaction-details">
                  <span class="transaction-title">{{ transaction.title }}</span>
                  <span class="transaction-desc">{{ transaction.description }}</span>
                </div>
              </td>
              <td>
                <span :class="['transaction-amount', transaction.type]">
                  {{ transaction.type === 'credit' ? '+' : '-' }}${{ transaction.amount }}
                </span>
              </td>
              <td>{{ formatDateTime(transaction.dateTime) }}</td>
              <td>{{ transaction.reference }}</td>
              <td>
                <span :class="['status-badge', 'status-' + transaction.status.toLowerCase()]">
                  {{ transaction.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="filteredTransactions.length > 0" class="pagination">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button @click="nextPage">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

export default {
  name: 'HistoryComponent',
  data() {
    return {
      currentDate: new Date().toISOString().split('T')[0],
      selectedFilter: 'all',
      searchTerm: '',
      currentPage: 1,
      pageSize: 8,
      transactions: [],
      loading: true,
      error: null
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
          transaction.reference.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.transactions.length / this.pageSize);
    }
  },
  methods: {
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
        
        // Query transactions for the current user, ordered by date
        const q = query(
          transactionsRef,
          where('userId', '==', user.uid),
          orderBy('dateTime', 'desc')
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
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      } else {
        this.currentPage = 1;
      }
    }
  },
  async created() {
    await this.fetchTransactions();
  }
};
</script>

<style scoped>
/* History Specific Styles */
.history-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.transaction-panel {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  transition: all 300ms ease;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  color: var(--color-dark);
  font-size: 1.2rem;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-light);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
}

.search-input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-light);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  width: 150px;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.transaction-table th,
.transaction-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transaction-table th {
  font-weight: 600;
  color: #666;
  background-color: #f8f9fa;
}

.transaction-table td {
  padding: 0.8rem;
  border-bottom: 1px solid var(--color-light);
  color: var(--color-dark-variant);
}

.transaction-table tr:last-child td {
  border-bottom: none;
}

.transaction-table tr:hover {
  background: var(--color-light);
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

.status-failed {
  background-color: #ffebee;
  color: #c62828;
}

.status-pending {
  background-color: #fff3e0;
  color: #ef6c00;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
}

.pagination button {
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--color-light);
  background: var(--color-white);
  border-radius: 0.3rem;
  cursor: pointer;
  transition: all 300ms ease;
}

.pagination button:hover {
  background: var(--color-light);
}

.pagination button.active {
  background: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
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
  font-size: 0.85rem;
  color: var(--color-dark-variant);
}

@media screen and (max-width: 1024px) {
  .transaction-table th:nth-child(3),
  .transaction-table td:nth-child(3) {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .transaction-table th:nth-child(4),
  .transaction-table td:nth-child(4) {
    display: none;
  }
  
  .search-input {
    width: 100px;
  }
}

/* Add these new styles */
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
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.no-transactions .material-icons {
  font-size: 64px;
  margin-bottom: 16px;
  color: #999;
}

.no-transactions p {
  font-size: 18px;
  margin-bottom: 8px;
}

.no-transactions .sub-text {
  font-size: 14px;
  color: #999;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>