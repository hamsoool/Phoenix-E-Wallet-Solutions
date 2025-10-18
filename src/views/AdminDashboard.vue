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
        <!-- Admin Stats Cards -->
        <div class="admin-stats">
          <!-- Admin Wallet Card -->
          <div class="card admin-wallet-card">
            <div class="card-content">
              <span class="material-icons">account_balance_wallet</span>
              <h3>Admin Wallet</h3>
              <h1>₱{{ adminWallet }}</h1>
              <small>Total system revenue</small>
            </div>
          </div>
          
          <!-- Total Members Card -->
          <div class="card total-members-card">
            <div class="card-content">
              <span class="material-icons">group</span>
              <h3>Total Members</h3>
              <h1>{{ totalMembers }}</h1>
              <small>All registered members</small>
            </div>
          </div>

          <!-- Half-Winged Phoenix Card -->
          <div class="card half-winged-card">
            <div class="card-content">
              <span class="material-icons">star_half</span>
              <h3>Half-Winged Phoenix</h3>
              <h1>{{ halfWingedMembers }}</h1>
              <small>Half-Winged members</small>
            </div>
          </div>

          <!-- Phoenix Members Card -->
          <div class="card phoenix-card">
            <div class="card-content">
              <span class="material-icons">stars</span>
              <h3>Phoenix Members</h3>
              <h1>{{ phoenixMembers }}</h1>
              <small>Full Phoenix members</small>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <section class="recent-activities">
          <h2>Recent Membership Payments</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Membership Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date & Time</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="recentActivities.length === 0">
                  <td colspan="6" style="text-align:center; color:#888; font-size:1.1rem; padding: 32px 0;">
                    No records can be found
                  </td>
                </tr>
                <tr v-for="transaction in recentActivities" :key="transaction.id">
                  <td>
                    <div class="user-info">
                      <span class="user-email">{{ transaction.firstName }} {{ transaction.lastName }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['type-badge', 'type-' + transaction.membershipType]">
                      <span class="material-icons type-icon">{{ transaction.membershipType === 'fullYear' ? 'stars' : 'star_half' }}</span>
                      {{ transaction.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix' }}
                    </span>
                  </td>
                  <td>
                    <template v-if="transaction.paymentMethod === 'tokens' && transaction.amount && transaction.amount !== '-'">
                      $ASH {{ Number(transaction.amount) }}
                    </template>
                    <template v-else-if="transaction.amount && transaction.amount !== '-'">
                      ₱{{ Number(transaction.amount).toFixed(2) }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>{{ transaction.paymentMethod === 'wallet' ? 'Wallet Balance' : 'Game Tokens' }}</td>
                  <td>
                    <div class="date-info">
                      <span class="date">{{ formatDate(transaction.dateTime) }}</span>
                      <span class="time">{{ formatTime(transaction.dateTime) }}</span>
                    </div>
                  </td>
                  <td>
                    <button class="icon-btn" @click="viewTransactionDetails(transaction)" title="View Details">
                      <span class="material-icons">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="view-all-container">
            <router-link to="/admin/history" class="view-all">View All Membership Payments</router-link>
          </div>
        </section>

        <!-- Transaction Details Modal -->
        <div v-if="showActionDetails" class="modal">
          <div class="modal-backdrop" @click="closeActionDetails"></div>
          <div class="modal-content">
            <h2 style="text-align:center; font-size:2rem; font-weight:700; margin-bottom:1.5rem;">Transaction Details</h2>
            <div class="details-content" v-if="selectedAction">
              <div class="detail-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.95rem; color:#888; font-weight:500;">Member</label>
                <p style="font-size:1.1rem; font-weight:600; color:#222; margin-bottom: 4px;">{{ selectedAction.firstName }} {{ selectedAction.lastName }}</p>
                <p style="font-size:0.95rem; color:#555; margin:0;">{{ selectedAction.email }}</p>
              </div>
              <div class="detail-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.95rem; color:#888; font-weight:500;">Membership Type</label>
                <p style="margin:0;">
                  <span :class="['type-badge', 'type-' + selectedAction.membershipType]" style="font-size:1.05rem; padding:7px 16px;">
                    <span class="material-icons type-icon">{{ selectedAction.membershipType === 'fullYear' ? 'stars' : 'star_half' }}</span>
                    {{ selectedAction.membershipType === 'fullYear' ? 'Phoenix' : 'Half-Winged Phoenix' }}
                  </span>
                </p>
              </div>
              <div class="detail-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.95rem; color:#888; font-weight:500;">Amount Paid</label>
                <p style="font-size:1.1rem; font-weight:700; color:#222; margin:0;">
                  <template v-if="selectedAction.paymentMethod === 'tokens' && selectedAction.amount && selectedAction.amount !== '-'">
                    $ASH {{ Number(selectedAction.amount) }}
                  </template>
                  <template v-else-if="selectedAction.amount && selectedAction.amount !== '-'">
                    ₱{{ Number(selectedAction.amount).toFixed(2) }}
                  </template>
                  <template v-else>
                    -
                  </template>
                </p>
              </div>
              <div class="detail-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.95rem; color:#888; font-weight:500;">Payment Method</label>
                <p style="font-size:1.05rem; font-weight:600; color:#222; margin:0;">{{ selectedAction.paymentMethod === 'wallet' ? 'Wallet Balance' : 'Game Tokens' }}</p>
              </div>
              <div class="detail-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.95rem; color:#888; font-weight:500;">Date & Time</label>
                <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                  <div class="modal-card-box">
                    {{ formatDate(selectedAction.dateTime) }}
                  </div>
                  <div style="color:#888; font-size:1rem; font-weight:500; text-align:center;">{{ formatTime(selectedAction.dateTime) }}</div>
                </div>
              </div>
              <div class="detail-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.95rem; color:#888; font-weight:500;">Membership Expiry</label>
                <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                  <div class="modal-card-box">
                    {{ formatDate(selectedAction.expiryDate) }}
                  </div>
                  <div style="color:#888; font-size:1rem; font-weight:500; text-align:center;">{{ formatTime(selectedAction.expiryDate) }}</div>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="close-btn" @click="closeActionDetails">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showElitePieChart" class="modal">
        <div class="modal-backdrop" @click="showElitePieChart = false"></div>
        <div class="modal-content">
          <h2>Elite Members by Year Level</h2>
          <p style="margin-bottom: 1rem; color: #666; font-size: 1rem;">This chart shows the distribution of active paid elite members by their college year level. Use this to understand which year levels are most engaged in the organization.</p>
          <canvas id="elitePieChart" style="max-width: 350px; margin: 0 auto;"></canvas>
          <div class="modal-actions">
            <button class="close-btn" @click="showElitePieChart = false">Close</button>
          </div>
        </div>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit, getDocs, where, doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'dashboard',
      adminWallet: 0,
      totalMembers: 0,
      halfWingedMembers: 0,
      phoenixMembers: 0,
      recentActivities: [],
      showWithdrawModal: false,
      showTransferModal: false,
      pageTitles: {
        dashboard: 'Admin Dashboard',
        elites: 'Elite Members',
        history: 'Membership History',
        members: 'Official Members',
        help: 'Help & Support'
      },
      now: new Date(),
      showActionDetails: false,
      selectedAction: null,
      showDepositModal: false,
      showMembershipModal: false,
      usersUnsub: null,
      txUnsub: null,
      showElitePieChart: false,
      elitePieChartInstance: null,
      eliteYearData: {},
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
        await this.fetchAdminData();
      } else {
        this.router.push('/login');
      }
    });

    // Update time every second
    this.timer = setInterval(() => {
      this.now = new Date();
    }, 1000);

    await this.fetchAdminWallet();
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
    async fetchAdminData() {
      try {
        // Listen for real-time updates to users
        const usersCol = collection(this.db, 'users');
        const usersUnsub = onSnapshot(usersCol, (usersSnapshot) => {
          const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Calculate member counts
          this.totalMembers = users.length;
          this.halfWingedMembers = users.filter(user => user.membershipType === 'semester').length;
          this.phoenixMembers = users.filter(user => user.membershipType === 'fullYear').length;

          // Filter paid members for transactions
          const paidUsers = users.filter(user => user.isPaid === true && 
            (user.membershipType === 'fullYear' || user.membershipType === 'semester'));
          
          // Map for quick lookup
          const userMap = {};
          paidUsers.forEach(user => {
            userMap[user.id] = user;
          });

          // Group by year level for pie chart
          const yearCounts = {};
          paidUsers.forEach(user => {
            const year = user.collegeYear || 'Unknown';
            yearCounts[year] = (yearCounts[year] || 0) + 1;
          });
          this.eliteYearData = yearCounts;

          // Listen for real-time updates to transactions
          const txQuery = query(
            collection(this.db, 'transactions'),
            where('title', '==', 'Membership Payment'),
            orderBy('dateTime', 'desc'),
            limit(5)
          );
          if (this.txUnsub) this.txUnsub(); // Remove previous listener if any
          this.txUnsub = onSnapshot(txQuery, (transactionsSnapshot) => {
            const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Debug log: show fetched transactions
            console.log('Fetched transactions:', transactions);
            // Join user info with transaction data, but always render the transaction
            this.recentActivities = transactions.map(tx => {
              const user = userMap[tx.userId] || {};
              let amount = '-';
              if (tx.paymentMethod === 'tokens' && tx.amount) {
                amount = Number(tx.amount);
              } else if (tx.amount) {
                amount = Number(tx.amount).toFixed(2);
              }
              const joined = {
                id: tx.id,
                email: user.email || tx.email || '-',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                membershipType: user.membershipType || tx.membershipType || '-',
                amount,
                paymentMethod: tx.paymentMethod,
                dateTime: tx.dateTime,
                expiryDate: user.membershipExpiry || tx.expiryDate || null
              };
              // Debug log: show joined data
              console.log('Joined transaction:', joined);
              return joined;
            });
            // Calculate total revenue if needed
            let totalRevenue = 0;
            transactions.forEach(tx => {
              if (tx.paymentMethod === 'tokens') {
                totalRevenue += Number(tx.amount || 0) / 10;
              } else {
                totalRevenue += Number(tx.amount || 0);
              }
            });
            this.adminWallet = totalRevenue;
          });
        });
        // Store unsubscribers for cleanup
        this.usersUnsub = usersUnsub;
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    },
    async fetchAdminWallet() {
      const walletDoc = await getDoc(doc(this.db, 'admin_wallet', 'main'));
      if (walletDoc.exists()) {
        this.adminWallet = walletDoc.data().balance || 0;
      } else {
        // Optionally, initialize if not exists
        await setDoc(doc(this.db, 'admin_wallet', 'main'), { balance: 0 });
        this.adminWallet = 0;
      }
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
    viewTransactionDetails(transaction) {
      this.selectedAction = transaction;
      this.showActionDetails = true;
    },
    closeActionDetails() {
      this.showActionDetails = false;
      this.selectedAction = null;
    },
    renderElitePieChart() {
      if (!this.showElitePieChart) return;
      const canvas = document.getElementById('elitePieChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const labels = Object.keys(this.eliteYearData);
      const data = Object.values(this.eliteYearData);
      const backgroundColors = [
        '#ff6a00', '#ff9800', '#ffd180', '#ffb300', '#ffcc80', '#ffa726', '#ffe0b2', '#ff7043', '#ffab91', '#ff8a65'
      ];
      if (this.elitePieChartInstance) {
        this.elitePieChartInstance.destroy();
      }
      this.elitePieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#444',
                font: { size: 14 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value} member${value !== 1 ? 's' : ''}`;
                }
              }
            }
          }
        }
      });
    },
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
    if (this.usersUnsub) this.usersUnsub();
    if (this.txUnsub) this.txUnsub();
  },
  watch: {
    showElitePieChart(val) {
      if (val) {
        this.$nextTick(() => {
          this.renderElitePieChart();
        });
      } else if (this.elitePieChartInstance) {
        this.elitePieChartInstance.destroy();
        this.elitePieChartInstance = null;
      }
    }
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
  transition: transform 0.3s ease;
  transform: translateX(0); /* Default position for desktop */
}

#sidebar.show {
  transform: translateX(0);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-dark);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  margin-right: 8px;
  order: -1; /* This ensures the button appears first */
}

.menu-toggle:hover {
  background-color: var(--color-light);
}

.close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-dark);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: var(--color-light);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-light);
}

.logo {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.logo img {
  width: 80%;
  height: auto;
  object-fit: contain;
}

.sidebar-nav {
  padding: 8px;
  flex-grow: 1;
}

.sidebar-nav a,
.sidebar-nav .sidebar-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: var(--color-dark-variant);
  text-decoration: none;
  transition: var(--transition);
  border-radius: 4px;
  margin: 2px 0;
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
  margin-right: 12px;
  font-size: 20px;
  min-width: 24px; /* Ensures consistent icon width */
}

.sidebar-nav h3 {
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
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
}

.main-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-light);
  gap: 16px;
  margin-top: 0; /* Ensure no top margin */
}

.main-header h1 {
  margin: 0;
  flex: 1;
  text-align: left;
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

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.card {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 87, 34, 0.1);
}

.admin-wallet-card {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: white;
}

.admin-wallet-card .material-icons {
  font-size: 32px;
  color: white;
  margin-bottom: 10px;
}

.admin-wallet-card h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.admin-wallet-card h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
}

.admin-wallet-card small {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  display: block;
  margin-bottom: 20px;
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

.action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  background-color: rgba(255, 255, 255, 0.3);
}

.action-btn .material-icons {
  font-size: 16px;
  margin-bottom: 0;
}

.elite-card {
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.05), rgba(255, 87, 34, 0.1));
}

.elite-card .material-icons {
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 10px;
}

.elite-card h3 {
  color: var(--color-dark-variant);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.elite-card h1 {
  color: var(--color-dark);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--color-dark), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.elite-card small {
  color: var(--color-dark-variant);
  font-size: 0.85rem;
  display: block;
}

.elite-members-list {
  margin-top: 30px;
}

.elite-members-list h2 {
  margin-bottom: 15px;
  color: var(--color-dark);
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

.user-info {
  display: flex;
  flex-direction: column;
}

.user-email {
  font-weight: 500;
  color: var(--color-dark);
}

.icon-btn {
  background: none;
  border: none;
  color: var(--color-dark-variant);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 0.3rem;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: var(--color-light);
  color: var(--color-primary);
}

.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.view-all {
  display: inline-block;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-light);
}

.view-all:hover {
  color: var(--color-white);
  background: var(--color-primary);
  text-decoration: none;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-content {
  position: relative;
  background: var(--color-white);
  padding: 32px 24px;
  border-radius: 1rem;
  width: 95vw;
  max-width: 420px;
  max-height: 90vh;
  height: auto;
  box-shadow: var(--box-shadow);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  box-sizing: border-box;
}

.details-content {
  margin: 1.5rem 0;
}

.detail-group {
  margin-bottom: 1rem;
}

.detail-group label {
  display: block;
  color: var(--color-dark-variant);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.detail-group p {
  color: var(--color-dark);
  font-weight: 500;
}

.detail-group p .type-badge {
  margin-top: 0.3rem;
}

.detail-group p .date-info {
  margin-top: 0.3rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.close-btn {
  padding: 0.8rem 1.5rem;
  background: var(--color-light);
  color: var(--color-dark);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--color-dark-variant);
  color: var(--color-white);
}

.detail-group .modal-card-box {
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
  background: #f5f5f5;
  color: #222;
  border-radius: 10px;
  padding: 10px 0;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 2px;
  text-align: center;
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

.total-members-card {
  background: linear-gradient(135deg, #ff4444, #ff6666);
  color: white;
}

.half-winged-card {
  background: linear-gradient(135deg, #ff8800, #ffaa33);
  color: white;
}

.phoenix-card {
  background: linear-gradient(135deg, #ff0000, #ff3333);
  color: white;
}

.total-members-card .material-icons,
.half-winged-card .material-icons,
.phoenix-card .material-icons {
  font-size: 32px;
  color: white;
  margin-bottom: 10px;
}

.total-members-card h3,
.half-winged-card h3,
.phoenix-card h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.total-members-card h1,
.half-winged-card h1,
.phoenix-card h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
}

.total-members-card small,
.half-winged-card small,
.phoenix-card small {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  display: block;
  margin-bottom: 20px;
}

@media screen and (max-width: 1200px) {
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .admin-stats {
    grid-template-columns: 1fr;
  }
}
</style>