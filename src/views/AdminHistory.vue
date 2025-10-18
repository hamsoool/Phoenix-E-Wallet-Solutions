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
        <router-link to="/admin" class="sidebar-link" active-class="active">
          <span class="material-icons">dashboard</span>
          <h3>Dashboard</h3>
        </router-link>
        <router-link to="/admin/profile" class="sidebar-link" active-class="active">
          <span class="material-icons">account_circle</span>
          <h3>Admin Profile</h3>
        </router-link>
        <router-link to="/admin/elites" class="sidebar-link" active-class="active">
          <span class="material-icons">stars</span>
          <h3>Elites</h3>
        </router-link>
        <router-link to="/admin/history" class="sidebar-link" active-class="active">
          <span class="material-icons">history</span>
          <h3>History</h3>
        </router-link>
        <router-link to="/admin/members" class="sidebar-link" active-class="active">
          <span class="material-icons">group</span>
          <h3>Members</h3>
        </router-link>
        <router-link to="/admin/support" class="sidebar-link" active-class="active">
          <span class="material-icons">help</span>
          <h3>Help & Support</h3>
        </router-link>
        <a href="#" @click.prevent="logout" class="sidebar-link">
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

      <!-- History Content -->
      <div v-if="currentPage === 'history'">
        <!-- History Filters -->
        <div class="history-filters">
          <div class="filter-header">
            <div class="header-left">
              <h2>Filter Transactions</h2>
              <span class="active-filters" v-if="activeFilterCount > 0">
                {{ activeFilterCount }} active filter{{ activeFilterCount > 1 ? 's' : '' }}
              </span>
            </div>
            <div class="filter-actions">
              <button class="filter-btn" @click="resetFilters" :disabled="activeFilterCount === 0">
                <span class="material-icons">refresh</span>
                Reset Filters
              </button>
              <button class="filter-btn export-btn" @click="exportToPDF">
                <span class="material-icons">download</span>
                Export Report
              </button>
            </div>
          </div>
          
          <div class="filter-grid">
            <div class="filter-group">
              <label for="membershipType">
                <span class="material-icons">category</span>
                Membership Type
              </label>
              <div class="select-wrapper">
                <select id="membershipType" v-model="filters.membershipType" class="filter-select" @change="onMembershipTypeChange">
                  <option value="">All Types</option>
                  <option value="fullYear">Phoenix</option>
                  <option value="semester">Half-Winged Phoenix</option>
                </select>
                <span class="material-icons select-icon">expand_more</span>
              </div>
            </div>
            
            <div class="filter-group">
              <label for="dateRange">
                <span class="material-icons">date_range</span>
                Date Range
              </label>
              <div class="select-wrapper">
                <select id="dateRange" v-model="filters.dateRange" class="filter-select">
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                <span class="material-icons select-icon">expand_more</span>
              </div>
            </div>

            <div class="filter-group custom-date" v-if="filters.dateRange === 'custom'">
              <label for="startDate">
                <span class="material-icons">event</span>
                Start Date
              </label>
              <div class="date-input-wrapper">
                <input type="date" id="startDate" v-model="filters.startDate" class="filter-input" :max="filters.endDate || maxDate">
                <span class="material-icons date-icon">calendar_today</span>
              </div>
            </div>

            <div class="filter-group custom-date" v-if="filters.dateRange === 'custom'">
              <label for="endDate">
                <span class="material-icons">event</span>
                End Date
              </label>
              <div class="date-input-wrapper">
                <input type="date" id="endDate" v-model="filters.endDate" class="filter-input" :min="filters.startDate || minDate" :max="maxDate">
                <span class="material-icons date-icon">calendar_today</span>
              </div>
            </div>
          </div>

          <div class="filter-footer">
            <div class="filter-info" v-if="filteredHistory.length > 0">
              Showing {{ filteredHistory.length }} transaction{{ filteredHistory.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>

        <!-- History Table -->
        <section class="history-table">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Membership Type</th>
                  <th>Amount</th>
                  <th>Payment/Transaction Date</th>
                  <th>Expiry Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredHistory" :key="user.id">
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>
                    <span :class="['type-badge', 'type-' + user.membershipType]">
                      <span class="material-icons type-icon">{{ user.membershipType === 'fullYear' ? 'stars' : 'star_half' }}</span>
                      {{ user.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix' }}
                    </span>
                  </td>
                  <td>{{ user.amount ? `₱${Number(user.amount).toFixed(2)}` : '-' }}</td>
                  <td>
                    <div class="date-info">
                      <span class="date">{{ formatShortDate(user.membershipStart || user.joinDate) }}</span>
                      <span class="time">{{ formatShortTime(user.membershipStart || user.joinDate) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="date-info">
                      <span class="date">{{ user.membershipExpiry ? formatShortDate(user.membershipExpiry) : '-' }}</span>
                      <span class="time">{{ user.membershipExpiry ? formatShortTime(user.membershipExpiry) : '' }}</span>
                    </div>
                  </td>
                  <td>
                    <button class="icon-btn" @click="viewTransactionDetails(user)" title="View Details">
                      <span class="material-icons">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Hidden Report Template for PDF Export -->
        <div ref="reportTemplate" style="display: none;">
          <h1>Membership Transaction Report</h1>
          <p>Generated on: {{ formattedDateTime }}</p>
          <h2>Summary</h2>
          <p>Total Transactions: {{ filteredHistory.length }}</p>
          <p>Total Revenue: ₱{{ totalRevenue }}</p>
          <p>New Members: {{ newMembers }}</p>
          <h2>Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Membership Type</th>
                <th>Amount</th>
                <th>Transaction Date</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredHistory" :key="user.id">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix' }}</td>
                <td>{{ user.amount ? `₱${Number(user.amount).toFixed(2)}` : '-' }}</td>
                <td>{{ formatShortDate(user.membershipStart || user.joinDate) }} {{ formatShortTime(user.membershipStart || user.joinDate) }}</td>
                <td>{{ user.membershipExpiry ? formatShortDate(user.membershipExpiry) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Member Details Modal -->
        <div v-if="showActionDetails" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-content member-details-modal">
              <div class="modal-icon" style="margin-bottom: 0;">
                <img v-if="selectedAction.avatar" :src="selectedAction.avatar" alt="Avatar" class="member-avatar-large" />
                <span v-else class="material-icons member-avatar-large" style="font-size: 90px; color: #ccc; display: flex; align-items: center; justify-content: center;">account_circle</span>
              </div>
              <h2 class="modal-title">{{ selectedAction.firstName ? selectedAction.firstName + ' ' + selectedAction.lastName : selectedAction.name }}</h2>
              <div class="member-details-list">
                <div class="member-detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ selectedAction.email }}</span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Membership Type:</span>
                  <span :class="['type-badge', 'type-' + (selectedAction.membershipType === 'fullYear' ? 'phoenix' : (selectedAction.membershipType === 'semester' ? 'half-winged-phoenix' : 'regular'))]">
                    <span class="material-icons type-icon">{{ selectedAction.membershipType === 'fullYear' ? 'stars' : (selectedAction.membershipType === 'semester' ? 'star_half' : 'person') }}</span>
                    {{ selectedAction.membershipType === 'fullYear' ? 'Phoenix' : (selectedAction.membershipType === 'semester' ? 'Half-Winged Phoenix' : 'Regular') }}
                  </span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value">{{ selectedAction.amount ? `₱${Number(selectedAction.amount).toFixed(2)}` : '-' }}</span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Payment/Transaction Date:</span>
                  <span class="detail-value">
                    {{ formatShortDate(selectedAction.membershipStart || selectedAction.joinDate) }}
                    <span class="detail-time">{{ formatShortTime(selectedAction.membershipStart || selectedAction.joinDate) }}</span>
                  </span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Expiry Date:</span>
                  <span class="detail-value">
                    {{ selectedAction.membershipExpiry ? formatShortDate(selectedAction.membershipExpiry) : '-' }}
                    <span class="detail-time">{{ selectedAction.membershipExpiry ? formatShortTime(selectedAction.membershipExpiry) : '' }}</span>
                  </span>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-button confirm" @click="closeActionDetails">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';
import html2pdf from 'html2pdf.js';

export default {
  name: 'AdminHistory',
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'history',
      history: [],
      showActionDetails: false,
      selectedAction: null,
      filters: {
        membershipType: '',
        dateRange: 'month',
        startDate: '',
        endDate: ''
      },
      pageTitles: {
        dashboard: 'Admin Dashboard',
        elites: 'Elite Members',
        history: 'Membership History',
        members: 'Official Members',
        help: 'Help & Support'
      },
      now: new Date(),
      maxDate: new Date().toISOString().split('T')[0],
      minDate: '2020-01-01',
      previousFilters: null
    };
  },
  computed: {
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
    filteredHistory() {
      let filtered = this.history;
      if (this.filters.membershipType) {
        filtered = filtered.filter(user => user.membershipType === this.filters.membershipType);
      }
      return filtered;
    },
    activeFilterCount() {
      let count = 0;
      if (this.filters.membershipType) count++;
      if (this.filters.dateRange !== 'month') count++;
      if (this.filters.startDate) count++;
      if (this.filters.endDate) count++;
      return count;
    },
    hasFilterChanges() {
      if (!this.previousFilters) return true;
      return JSON.stringify(this.filters) !== JSON.stringify(this.previousFilters);
    },
    totalRevenue() {
      return this.filteredHistory.reduce((sum, user) => sum + (Number(user.amount) || 0), 0).toFixed(2);
    },
    newMembers() {
      // Count members who joined in the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return this.filteredHistory.filter(user => {
        const joinDate = user.joinDate ? user.joinDate.toDate() : null;
        return joinDate && joinDate >= oneMonthAgo;
      }).length;
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
        await this.fetchHistoryData();
      } else {
        this.router.push('/login');
      }
    });

    // Update time every second
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
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
    async fetchHistoryData() {
      try {
        // Fetch only users who have paid their membership (Phoenix or Half-Winged Phoenix)
        const usersSnapshot = await getDocs(collection(this.db, 'users'));
        // Fetch all membership payment transactions
        const txQuery = query(
          collection(this.db, 'transactions'),
          where('title', '==', 'Membership Payment')
        );
        const txSnapshot = await getDocs(txQuery);
        // Map userId to latest payment transaction
        const txMap = {};
        txSnapshot.docs.forEach(doc => {
          const tx = doc.data();
          if (!tx.userId) return;
          // Only keep the latest transaction per user
          if (!txMap[tx.userId] || (tx.dateTime && txMap[tx.userId].dateTime && tx.dateTime.seconds > txMap[tx.userId].dateTime.seconds)) {
            txMap[tx.userId] = tx;
          }
        });
        this.history = usersSnapshot.docs
          .map(doc => {
            const data = doc.data();
            if (!(data.isPaid === true && (data.membershipType === 'fullYear' || data.membershipType === 'semester'))) return null;
            // Get amount from latest transaction
            let amount = null;
            const tx = txMap[doc.id];
            if (tx && tx.amount) {
              if (tx.paymentMethod === 'tokens') {
                amount = (Number(tx.amount) / 10).toFixed(2);
              } else {
                amount = Number(tx.amount).toFixed(2);
              }
            }
            return {
              id: doc.id,
              ...data,
              amount
            };
          })
          .filter(Boolean);
      } catch (error) {
        console.error('Error fetching history data:', error);
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
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    },
    applyFilters() {
      this.previousFilters = JSON.parse(JSON.stringify(this.filters));
      this.fetchHistoryData();
    },
    viewTransactionDetails(user) {
      this.selectedAction = user;
      this.showActionDetails = true;
    },
    closeActionDetails() {
      this.showActionDetails = false;
      this.selectedAction = null;
    },
    resetFilters() {
      this.filters = {
        membershipType: '',
        dateRange: 'month',
        startDate: '',
        endDate: ''
      };
      this.previousFilters = null;
      this.applyFilters();
    },
    formatShortDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    formatShortTime(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    },
    onMembershipTypeChange() {
      this.applyMembershipTypeFilter();
    },
    applyMembershipTypeFilter() {
      // This will trigger the computed filteredHistory to update
      // No need to do anything else if using computed
    },
    exportToPDF() {
      // Create a temporary div for the report
      const reportDiv = document.createElement('div');
      reportDiv.style.padding = '20px';
      
      // Add report header
      const header = document.createElement('h1');
      header.textContent = 'Membership Transaction Report';
      header.style.textAlign = 'center';
      header.style.color = '#ff6a00';
      header.style.marginBottom = '20px';
      reportDiv.appendChild(header);
      
      // Add generation date
      const dateInfo = document.createElement('p');
      dateInfo.textContent = `Generated on: ${this.formattedDateTime}`;
      dateInfo.style.textAlign = 'center';
      dateInfo.style.marginBottom = '30px';
      reportDiv.appendChild(dateInfo);
      
      // Add summary section
      const summarySection = document.createElement('div');
      summarySection.style.marginBottom = '30px';
      
      const summaryTitle = document.createElement('h2');
      summaryTitle.textContent = 'Summary';
      summaryTitle.style.color = '#333';
      summaryTitle.style.borderBottom = '2px solid #ff6a00';
      summaryTitle.style.paddingBottom = '10px';
      summarySection.appendChild(summaryTitle);
      
      const summaryContent = document.createElement('div');
      summaryContent.style.display = 'grid';
      summaryContent.style.gridTemplateColumns = 'repeat(2, 1fr)';
      summaryContent.style.gap = '20px';
      summaryContent.style.marginTop = '20px';
      
      // Calculate summary statistics
      const totalRevenue = this.filteredHistory.reduce((sum, user) => sum + (Number(user.amount) || 0), 0);
      const phoenixMembers = this.filteredHistory.filter(user => user.membershipType === 'fullYear').length;
      const halfWingedMembers = this.filteredHistory.filter(user => user.membershipType === 'semester').length;
      
      const summaryItems = [
        { label: 'Total Transactions', value: this.filteredHistory.length },
        { label: 'Total Revenue', value: `₱${totalRevenue.toFixed(2)}` },
        { label: 'Phoenix Members', value: phoenixMembers },
        { label: 'Half-Winged Members', value: halfWingedMembers },
        { label: 'New Members This Month', value: this.newMembers },
        { label: 'Average Revenue', value: `₱${(totalRevenue / (this.filteredHistory.length || 1)).toFixed(2)}` }
      ];
      
      summaryItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.padding = '15px';
        itemDiv.style.backgroundColor = '#f8f9fa';
        itemDiv.style.borderRadius = '8px';
        itemDiv.style.textAlign = 'center';
        
        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '5px';
        label.style.color = '#666';
        
        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.fontSize = '1.2em';
        value.style.color = '#ff6a00';
        
        itemDiv.appendChild(label);
        itemDiv.appendChild(value);
        summaryContent.appendChild(itemDiv);
      });
      
      summarySection.appendChild(summaryContent);
      reportDiv.appendChild(summarySection);
      
      // Add transactions table
      const tableSection = document.createElement('div');
      
      const tableTitle = document.createElement('h2');
      tableTitle.textContent = 'Transaction Details';
      tableTitle.style.color = '#333';
      tableTitle.style.borderBottom = '2px solid #ff6a00';
      tableTitle.style.paddingBottom = '10px';
      tableTitle.style.marginBottom = '20px';
      tableSection.appendChild(tableTitle);
      
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginTop = '20px';
      
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['Name', 'Membership Type', 'Amount', 'Transaction Date', 'Expiry Date'];
      
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.backgroundColor = '#ff6a00';
        th.style.color = 'white';
        th.style.padding = '12px';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      this.filteredHistory.forEach(user => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #ddd';
        
        const cells = [
          `${user.firstName} ${user.lastName}`,
          user.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix',
          user.amount ? `₱${Number(user.amount).toFixed(2)}` : '-',
          `${this.formatShortDate(user.membershipStart || user.joinDate)} ${this.formatShortTime(user.membershipStart || user.joinDate)}`,
          user.membershipExpiry ? this.formatShortDate(user.membershipExpiry) : '-'
        ];
        
        cells.forEach(cellText => {
          const td = document.createElement('td');
          td.textContent = cellText;
          td.style.padding = '12px';
          row.appendChild(td);
        });
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      tableSection.appendChild(table);
      reportDiv.appendChild(tableSection);
      
      // Configure PDF options
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'membership_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      // Generate PDF
      html2pdf().set(opt).from(reportDiv).save();
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false;
      }
    });
  },
  beforeUnmount() {
    clearInterval(this.timer);
  }
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  overflow: hidden;
  position: relative;
  width: 100%;
}

#sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  z-index: 20;
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

.sidebar-nav {
  padding: 8px 0;
  flex-grow: 1;
}

.sidebar-nav a,
.sidebar-nav .sidebar-link {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  color: var(--color-dark-variant);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 4px;
  margin: 2px 6px;
}

.sidebar-nav a.active,
.sidebar-nav .sidebar-link.active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.sidebar-nav a:hover:not(.active),
.sidebar-nav .sidebar-link:hover:not(.active) {
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
  left: 240px;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: var(--card-padding);
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
  margin-top: 0;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
  padding: 0 0 10px 0;
  border-bottom: 1px solid var(--color-light);
  position: relative;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--color-dark);
  border-radius: 4px;
  transition: var(--transition);
}

.menu-toggle:hover {
  background-color: var(--color-light);
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

.history-filters {
  background-color: var(--color-white);
  padding: 32px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 24px;
  transition: all 0.3s ease;
  width: 100%;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-dark);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-dark);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.filter-group label .material-icons {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.select-wrapper,
.date-input-wrapper {
  position: relative;
  width: 100%;
}

.select-icon,
.date-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  pointer-events: none;
  font-size: 1.2rem;
  opacity: 0.8;
  z-index: 1;
}

.select-wrapper:hover .select-icon,
.date-input-wrapper:hover .date-icon {
  opacity: 1;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background-color: var(--color-white);
  color: var(--color-dark);
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none;
  font-weight: 500;
  background-image: linear-gradient(45deg, transparent 50%, var(--color-primary) 50%),
                    linear-gradient(135deg, var(--color-primary) 50%, transparent 50%);
  background-position: calc(100% - 20px) calc(1em + 2px),
                       calc(100% - 15px) calc(1em + 2px);
  background-size: 5px 5px,
                  5px 5px;
  background-repeat: no-repeat;
  background-color: var(--color-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-select:hover,
.filter-input:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.filter-select:focus,
.filter-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.filter-select option {
  font-weight: 500;
  padding: 12px;
  background-color: var(--color-white);
  color: var(--color-dark);
}

.filter-select option:first-child {
  font-weight: 600;
  color: var(--color-primary);
  background-color: rgba(255, 87, 34, 0.05);
}

.filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--color-light);
}

.filter-info {
  color: var(--color-dark);
  font-size: 1rem;
  font-weight: 500;
}

.apply-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.apply-btn:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-light);
  color: var(--color-dark-variant);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.export-btn {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.export-btn:hover {
  background-color: var(--color-primary-light);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background-color: var(--color-light-variant);
}

th {
  padding: 12px;
  text-align: left;
  color: var(--color-dark-variant);
  font-weight: 600;
}

td {
  padding: 12px;
  color: var(--color-dark-variant);
  border-bottom: 1px solid var(--color-light);
}

tbody tr:hover {
  background-color: var(--color-light-variant);
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-weight: 500;
  color: var(--color-dark);
}

.admin-role {
  font-size: 0.8rem;
  color: var(--color-dark-variant);
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.type-badge .type-icon {
  font-size: 1rem;
}

.type-badge.type-fullYear {
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 87, 34, 0.2));
  color: var(--color-primary);
  border: 1px solid rgba(255, 87, 34, 0.2);
}

.type-badge.type-semester {
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.2));
  color: #ff6a00;
  border: 1px solid rgba(255, 165, 0, 0.2);
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.date-info .date {
  font-weight: 500;
  color: var(--color-dark);
}

.date-info .time {
  font-size: 0.85rem;
  color: var(--color-dark-variant);
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark-variant);
  padding: 4px;
  border-radius: 4px;
  transition: var(--transition);
}

.icon-btn:hover {
  background-color: var(--color-light);
}

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

.modal-container {
  background-color: var(--color-white);
  padding: 24px;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 600px;
  position: relative;
  z-index: 1001;
}

.modal-content {
  background-color: var(--color-white);
  padding: 24px;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 600px;
  position: relative;
  z-index: 1001;
}

.member-details-modal {
  background: #fff !important;
  color: #222;
  border-radius: 18px;
  max-width: 420px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 32px 28px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-word;
  overflow-wrap: break-word;
}

.member-avatar-large {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff6a00;
  margin-bottom: 10px;
  background: #fff;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #ff6a00;
  text-align: center;
}

.member-details-list {
  width: 100%;
  margin-bottom: 18px;
}

.member-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
  font-size: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #444;
  flex: 0 0 120px;
}

.detail-value {
  color: #222;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
  overflow-wrap: anywhere;
  max-width: 200px;
}

.detail-time {
  display: block;
  font-size: 0.92em;
  color: #888;
  font-weight: 400;
}

.type-badge, .status-badge {
  font-size: 0.95em;
  padding: 6px 14px;
  border-radius: 16px;
  font-weight: 600;
  margin-left: 4px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.modal-button.confirm {
  background: #ff6a00;
  color: #fff;
  font-weight: 700;
  border-radius: 30px;
  padding: 12px 32px;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-button.confirm:hover {
  background: #e65c00;
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

  .history-filters {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .filter-group {
    grid-column: span 1;
  }

  .date-range-wrapper {
    grid-column: span 2;
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
    margin-top: 0;
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

  .main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-top: 8px;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    left: 0;
    transform: none;
    z-index: 10;
  }

  .main-header h1 {
    text-align: left;
    margin: 0;
    font-size: 1.5rem;
    padding-left: 0;
    width: 100%;
  }

  .current-datetime {
    display: none;
  }

  .history-filters {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-group {
    grid-column: span 1;
  }

  .date-range-wrapper {
    grid-column: span 1;
    flex-direction: column;
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

  .member-details-modal {
    width: 95%;
    max-width: none;
    margin: 16px;
    padding: 24px 20px;
  }
}

@media screen and (max-width: 480px) {
  main {
    padding: 0 12px 12px 12px;
    margin-top: 0;
  }

  .main-header {
    gap: 8px;
    padding-top: 6px;
  }

  .main-header h1 {
    font-size: 1.25rem;
  }

  .history-filters {
    gap: 12px;
  }

  .filter-group label {
    font-size: 0.9rem;
  }

  .filter-group select,
  .filter-group input {
    font-size: 0.9rem;
    padding: 8px 12px;
  }

  .table-wrapper {
    margin: 0 -12px;
  }

  th, td {
    padding: 8px;
    font-size: 0.9rem;
  }

  .type-badge,
  .status-badge {
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .modal-content,
  .member-details-modal {
    padding: 16px;
    margin: 12px;
  }

  .member-avatar-large {
    width: 70px;
    height: 70px;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .member-detail-row {
    font-size: 0.9rem;
  }

  .detail-label {
    font-size: 0.85rem;
  }

  .detail-value {
    font-size: 0.9rem;
  }
}

/* Add smooth transitions for all responsive changes */
#sidebar,
main,
.main-header,
.history-filters,
.table-wrapper,
.modal-content,
.member-details-modal {
  transition: all 0.3s ease-in-out;
}

/* Ensure modals are always responsive */
.modal {
  padding: 16px;
}

.modal-content,
.member-details-modal {
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
</style>
