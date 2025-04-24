<template>
    <div>
      <div class="dash-header">
        <h1>Transaction History</h1>
        <div class="date">
          <input type="date" v-model="currentDate">
        </div>
      </div>
  
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
              <button class="btn-export" @click="exportData">
                <span class="material-icons">download</span>
                Export
              </button>
            </div>
          </div>
  
          <table class="transaction-table">
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
              <tr v-for="(transaction, index) in filteredTransactions" :key="index">
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
                <td>{{ transaction.dateTime }}</td>
                <td>{{ transaction.reference }}</td>
                <td>
                  <span :class="['status-badge', 'status-' + transaction.status.toLowerCase()]">
                    {{ transaction.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
  
          <div class="pagination">
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
  
        <!-- Activity Log -->
        <div class="activity-panel">
          <div class="panel-header">
            <h2>Account Activity</h2>
          </div>
          <div class="activity-log">
            <div class="activity-item" v-for="(activity, index) in activities" :key="index">
              <div class="activity-icon">
                <span class="material-icons">{{ activity.icon }}</span>
              </div>
              <div class="activity-details">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.description }}</p>
              </div>
              <div class="activity-time">
                {{ activity.time }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HistoryComponent',
    data() {
      return {
        currentDate: new Date().toISOString().split('T')[0],
        selectedFilter: 'all',
        searchTerm: '',
        currentPage: 1,
        pageSize: 8,
        transactions: [
          {
            title: 'Game Purchase',
            description: 'Premium Game Access',
            amount: '101.50',
            type: 'debit',
            dateTime: 'Apr 15, 2025, 11:00 PM',
            reference: '#TX-4589215',
            status: 'Completed'
          },
          {
            title: 'Account Deposit',
            description: 'Bank Transfer',
            amount: '500.00',
            type: 'credit',
            dateTime: 'Apr 15, 2025, 10:45 PM',
            reference: '#TX-4589214',
            status: 'Completed'
          },
          {
            title: 'Item Purchase',
            description: 'Virtual Item',
            amount: '103.25',
            type: 'debit',
            dateTime: 'Apr 14, 2025, 02:30 PM',
            reference: '#TX-4589213',
            status: 'Failed'
          },
          {
            title: 'Account Withdrawal',
            description: 'To Bank Account',
            amount: '250.00',
            type: 'debit',
            dateTime: 'Apr 12, 2025, 09:15 AM',
            reference: '#TX-4589212',
            status: 'Failed'
          },
          {
            title: 'Game Winnings',
            description: 'Tournament #52',
            amount: '325.50',
            type: 'credit',
            dateTime: 'Apr 10, 2025, 03:20 PM',
            reference: '#TX-4589211',
            status: 'Completed'
          },
          {
            title: 'Subscription Renewal',
            description: 'Premium Membership',
            amount: '49.99',
            type: 'debit',
            dateTime: 'Apr 10, 2025, 12:00 AM',
            reference: '#TX-4589210',
            status: 'Completed'
          },
          {
            title: 'Account Deposit',
            description: 'Credit Card',
            amount: '300.00',
            type: 'credit',
            dateTime: 'Apr 08, 2025, 11:05 AM',
            reference: '#TX-4589209',
            status: 'Completed'
          },
          {
            title: 'Game Purchase',
            description: 'Standard Access',
            amount: '59.99',
            type: 'debit',
            dateTime: 'Apr 05, 2025, 07:30 PM',
            reference: '#TX-4589208',
            status: 'Pending'
          }
        ],
        activities: [
          {
            icon: 'login',
            title: 'Account Login',
            description: 'Successful login from Chrome on Windows',
            time: '20 min ago'
          },
          {
            icon: 'credit_card',
            title: 'Payment Method Added',
            description: 'New credit card ending in 4582',
            time: 'Today, 12:42 PM'
          },
          {
            icon: 'lock',
            title: 'Password Changed',
            description: 'Your account password was updated successfully',
            time: 'Yesterday, 3:15 PM'
          },
          {
            icon: 'verified_user',
            title: 'Email Verified',
            description: 'Your email address has been verified',
            time: 'Apr 18, 10:28 AM'
          },
          {
            icon: 'account_balance_wallet',
            title: 'Wallet Created',
            description: 'Your digital wallet was set up successfully',
            time: 'Apr 15, 6:32 PM'
          }
        ]
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
      exportData() {
        alert('Exporting transaction history...');
        // In a real application, this would generate a CSV/PDF export
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        } else {
          this.currentPage = 1; // Wrap around to first page
        }
      }
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
  
  .transaction-panel, .activity-panel {
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
  }
  
  .transaction-table th {
    text-align: left;
    padding: 0.8rem;
    font-weight: 600;
    color: var(--color-dark);
    border-bottom: 1px solid var(--color-light);
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
    padding: 0.2rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-block;
  }
  
  .status-completed {
    background: rgba(0, 180, 0, 0.1);
    color: var(--color-success);
  }
  
  .status-failed {
    background: rgba(255, 0, 0, 0.1);
    color: rgb(255, 50, 50);
  }
  
  .status-pending {
    background: rgba(255, 165, 0, 0.1);
    color: orange;
  }
  
  .transaction-amount {
    font-weight: 600;
  }
  
  .transaction-amount.credit {
    color: var(--color-success);
  }
  
  .transaction-amount.debit {
    color: rgb(255, 50, 50);
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
  
  .activity-log {
    margin-top: 1rem;
  }
  
  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-light);
  }
  
  .activity-item:last-child {
    border-bottom: none;
  }
  
  .activity-icon {
    background: var(--color-light);
    border-radius: 50%;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .activity-icon span {
    font-size: 1.2rem;
    color: var(--color-primary);
  }
  
  .activity-details {
    flex: 1;
  }
  
  .activity-details h4 {
    margin-bottom: 0.3rem;
    color: var(--color-dark);
  }
  
  .activity-details p {
    font-size: 0.9rem;
    color: var(--color-dark-variant);
  }
  
  .activity-time {
    font-size: 0.8rem;
    color: var(--color-dark-variant);
    white-space: nowrap;
  }
  
  .btn-export {
    background: var(--color-primary);
    color: var(--color-white);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    transition: all 300ms ease;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .btn-export:hover {
    background: var(--color-primary-variant);
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
  
  @media screen and (min-width: 768px) {
    .history-container {
      grid-template-columns: 2fr 1fr;
    }
    
    .transaction-panel {
      grid-column: 1 / -1;
    }
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
  </style>