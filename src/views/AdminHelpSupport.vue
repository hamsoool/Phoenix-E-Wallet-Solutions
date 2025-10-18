<template>
  <div class="container">
    <!-- Sidebar Navigation -->
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
      <!-- Header -->
      <div class="main-header">
        <button id="menu-btn" class="menu-toggle" @click="openSidebar">
          <span class="material-icons">menu</span>
        </button>
        <h1>{{ pageTitles[currentPage] }}</h1>
        <div class="current-datetime">
          {{ formattedDateTime }}
        </div>
      </div>

      <!-- Support Stats -->
      <div class="support-stats">
        <div class="card">
          <div class="card-content">
            <span class="material-icons">report_problem</span>
            <h3>Active Issues</h3>
            <h1>{{ activeIssues }}</h1>
            <small>Open support requests</small>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <span class="material-icons">check_circle</span>
            <h3>Resolved Issues</h3>
            <h1>{{ resolvedIssues }}</h1>
            <small>Closed or resolved requests</small>
          </div>
        </div>
      </div>

      <!-- User Support Requests Section -->
      <section class="support-requests">
        <h2>User Support Requests</h2>
        <div class="ticket-filters">
          <div class="filter-group">
            <label for="supportStatus">Status</label>
            <select id="supportStatus" v-model="filters.status">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="supportSearch">Search</label>
            <input type="text" id="supportSearch" v-model="filters.search" placeholder="Search requests">
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>User Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in filteredSupportRequests" :key="req.id">
                <td>{{ req.subject }}</td>
                <td>{{ req.userEmail }}</td>
                <td style="vertical-align: middle;">
                  {{ req.message ? req.message.slice(0, 30) + (req.message.length > 30 ? '...' : '') : '' }}
                  <button @click="viewFullMessage(req)" title="View full message" class="icon-btn" style="margin-left: 8px; vertical-align: middle;">
                    <span class="material-icons eye-icon">visibility</span>
                  </button>
                </td>
                <td>
                  <span :class="{'status-active': req.status === 'open', 'status-resolved': req.status === 'resolved' || req.status === 'closed'}">
                    {{ req.status === 'open' ? 'Active' : 'Resolved' }}
                  </span>
                </td>
                <td>{{ req.timestamp && req.timestamp.toDate ? req.timestamp.toDate().toLocaleString() : '' }}</td>
                <td>{{ req.collegeYear || '-' }}</td>
                <td style="text-align: center; vertical-align: middle;">
                  <button v-if="req.status === 'open'" @click="openResolveModal(req)" title="Mark as Resolved" class="action-btn" style="margin: 0 auto;">
                    <span class="material-icons" style="font-size: 20px;">task_alt</span>
                  </button>
                  <span v-else style="color:gray;">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Message Modal -->
    <div v-if="showMessageModal" class="modal-overlay">
      <div class="modal-content centered-modal">
        <h3>Full Message</h3>
        <p>{{ messageModalContent }}</p>
        <button @click="closeMessageModal" class="close-modal-btn">Close</button>
      </div>
    </div>
    <!-- Resolve Confirmation Modal -->
    <div v-if="showResolveModal" class="modal-overlay">
      <div class="modal-content centered-modal">
        <h3>Mark as Resolved</h3>
        <p>Are you sure you want to mark this request as resolved?</p>
        <div class="modal-actions">
          <button @click="confirmResolve" class="resolve-btn">Yes, Resolve</button>
          <button @click="closeResolveModal" class="close-modal-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminHelpSupport',
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'help',
      activeIssues: 0,
      resolvedIssues: 0,
      tickets: [],
      supportRequests: [],
      showNewTicketModal: false,
      showTicketDetails: false,
      showFAQModal: false,
      selectedTicket: null,
      newTicket: {
        subject: '',
        description: '',
        priority: 'medium',
        category: 'technical'
      },
      newResponse: '',
      filters: {
        status: '',
        priority: '',
        search: ''
      },
      faqs: [
        {
          id: 1,
          question: 'How do I manage user accounts?',
          answer: 'You can manage user accounts through the Members section. Here you can view, edit, and manage user permissions. To access this feature, navigate to the Members tab in the sidebar. You can perform actions such as updating user roles, managing membership status, and viewing user activity history.',
          isOpen: false
        },
        {
          id: 2,
          question: 'What are the different user roles and their permissions?',
          answer: 'There are three main roles in the system:\n\n1. Regular Members: Basic access to essential features\n2. Premium Members: Enhanced access with additional benefits\n3. VIP Members: Full access to all features and priority support\n\nEach role has specific permissions and access levels that can be managed through the admin dashboard.',
          isOpen: false
        },
        {
          id: 3,
          question: 'How do I handle support tickets effectively?',
          answer: 'Support tickets can be managed through the Help & Support section. Here\'s a step-by-step guide:\n\n1. Review new tickets in the Support Tickets section\n2. Prioritize tickets based on their urgency and type\n3. Respond promptly with clear, helpful information\n4. Update ticket status as you progress\n5. Close tickets only when fully resolved\n\nRemember to maintain clear communication with users throughout the process.',
          isOpen: false
        },
        {
          id: 4,
          question: 'How do I track user activity and history?',
          answer: 'User activity can be tracked through the History section. This includes:\n\n- Login history and session data\n- Membership changes and updates\n- Support ticket interactions\n- Account modifications\n\nYou can filter and search through this data to find specific information about any user.',
          isOpen: false
        },
        {
          id: 5,
          question: 'What are the best practices for managing elite members?',
          answer: 'When managing elite members, follow these best practices:\n\n1. Regular status reviews and updates\n2. Personalized communication and support\n3. Priority handling of their requests\n4. Regular feedback collection\n5. Special event invitations and benefits\n\nMaintain detailed records of all elite member interactions and preferences.',
          isOpen: false
        }
      ],
      pageTitles: {
        dashboard: 'Admin Dashboard',
        elites: 'Elite Members',
        history: 'Admin History',
        members: 'Official Members',
        help: 'Help & Support'
      },
      now: new Date(),
      supportRequestsLoading: true,
      supportRequestsError: '',
      showMessageModal: false,
      messageModalContent: '',
      showResolveModal: false,
      resolveTarget: null
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
    filteredTickets() {
      let filtered = [...this.tickets];

      // Apply status filter
      if (this.filters.status) {
        filtered = filtered.filter(ticket => ticket.status === this.filters.status);
      }

      // Apply priority filter
      if (this.filters.priority) {
        filtered = filtered.filter(ticket => ticket.priority === this.filters.priority);
      }

      // Apply search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        filtered = filtered.filter(ticket => 
          ticket.subject.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    },
    filteredSupportRequests() {
      let filtered = [...this.supportRequests];
      if (this.filters.status) {
        if (this.filters.status === 'active') {
          filtered = filtered.filter(req => req.status === 'open');
        } else if (this.filters.status === 'resolved') {
          filtered = filtered.filter(req => req.status === 'resolved' || req.status === 'closed');
        }
      }
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        filtered = filtered.filter(req =>
          req.subject.toLowerCase().includes(searchLower) ||
          req.userEmail.toLowerCase().includes(searchLower) ||
          (req.message && req.message.toLowerCase().includes(searchLower))
        );
      }
      return filtered;
    }
  },
  async created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.router = useRouter();
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchTicketData();
        await this.fetchSupportRequests();
      } else {
        this.router.push('/login');
      }
    });
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
    async fetchTicketData() {
      try {
        // Fetch all tickets
        const ticketsSnapshot = await getDocs(query(
          collection(this.db, 'tickets'),
          orderBy('createdAt', 'desc')
        ));
        
        this.tickets = ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate statistics
        this.activeIssues = this.tickets.filter(ticket => 
          ticket.status === 'open' || ticket.status === 'in-progress'
        ).length;

        this.resolvedIssues = this.tickets.filter(ticket => {
          const resolvedDate = ticket.updatedAt.toDate();
          const today = new Date();
          return ticket.status === 'resolved' && 
                 resolvedDate.getDate() === today.getDate() &&
                 resolvedDate.getMonth() === today.getMonth() &&
                 resolvedDate.getFullYear() === today.getFullYear();
        }).length;

      } catch (error) {
        console.error('Error fetching ticket data:', error);
      }
    },
    async fetchSupportRequests() {
      this.supportRequestsLoading = true;
      this.supportRequestsError = '';
      try {
        const db = this.db || getFirestore(app);
        const q = query(collection(db, 'supportRequests'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // For each request, fetch the user's collegeYear from users collection
        const userDocs = {};
        const promises = requests.map(async req => {
          let collegeYear = req.collegeYear;
          if (!collegeYear) {
            let userDoc = null;
            if (req.userId) {
              if (!userDocs[req.userId]) {
                userDocs[req.userId] = await getDoc(doc(db, 'users', req.userId));
              }
              userDoc = userDocs[req.userId];
            } else if (req.userEmail) {
              // Find user by email (inefficient for large user bases)
              if (!userDocs[req.userEmail]) {
                const usersSnap = await getDocs(query(collection(db, 'users')));
                userDocs[req.userEmail] = usersSnap.docs.find(u => u.data().email === req.userEmail);
              }
              userDoc = userDocs[req.userEmail];
            }
            if (userDoc && userDoc.exists && userDoc.exists()) {
              collegeYear = userDoc.data().collegeYear || '-';
            } else if (userDoc && userDoc.data) {
              collegeYear = userDoc.data().collegeYear || '-';
            }
          }
          return { ...req, collegeYear };
        });
        this.supportRequests = await Promise.all(promises);
        // Update stats
        this.activeIssues = this.supportRequests.filter(req => req.status === 'open').length;
        this.resolvedIssues = this.supportRequests.filter(req => req.status === 'resolved' || req.status === 'closed').length;
      } catch (e) {
        this.supportRequestsError = 'Failed to load support requests.';
      } finally {
        this.supportRequestsLoading = false;
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
    async createTicket() {
      try {
        await addDoc(collection(this.db, 'tickets'), {
          ...this.newTicket,
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
          responses: []
        });

        await this.fetchTicketData();
        this.closeNewTicketModal();
        
      } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Error creating ticket. Please try again.');
      }
    },
    async closeTicket(ticket) {
      const newStatus = ticket.status === 'closed' ? 'open' : 'closed';
      const confirmMessage = newStatus === 'closed' 
        ? `Are you sure you want to close ticket #${ticket.id}?`
        : `Are you sure you want to reopen ticket #${ticket.id}?`;

      if (confirm(confirmMessage)) {
        try {
          await updateDoc(doc(this.db, 'tickets', ticket.id), {
            status: newStatus,
            updatedAt: new Date()
          });
          await this.fetchTicketData();
        } catch (error) {
          console.error('Error updating ticket status:', error);
          alert('Error updating ticket status. Please try again.');
        }
      }
    },
    viewTicket(ticket) {
      this.selectedTicket = ticket;
      this.showTicketDetails = true;
    },
    editTicket(ticket) {
      // Implement edit functionality
      console.log('Edit ticket:', ticket);
    },
    async addResponse() {
      if (!this.newResponse.trim()) return;

      try {
        const response = {
          id: Date.now(),
          author: this.user.email,
          content: this.newResponse,
          timestamp: new Date()
        };

        await updateDoc(doc(this.db, 'tickets', this.selectedTicket.id), {
          responses: [...this.selectedTicket.responses, response],
          updatedAt: new Date()
        });

        this.newResponse = '';
        await this.fetchTicketData();
        this.selectedTicket = this.tickets.find(t => t.id === this.selectedTicket.id);
        
      } catch (error) {
        console.error('Error adding response:', error);
        alert('Error adding response. Please try again.');
      }
    },
    toggleFAQ(faq) {
      faq.isOpen = !faq.isOpen;
    },
    closeNewTicketModal() {
      this.showNewTicketModal = false;
      this.newTicket = {
        subject: '',
        description: '',
        priority: 'medium',
        category: 'technical'
      };
    },
    closeTicketDetails() {
      this.showTicketDetails = false;
      this.selectedTicket = null;
      this.newResponse = '';
    },
    closeFAQModal() {
      this.showFAQModal = false;
    },
    applyFilters() {
      // Refresh the filtered data
      this.fetchTicketData();
    },
    viewFullMessage(req) {
      // Fetch the latest message from Firestore
      this.messageModalContent = '';
      this.showMessageModal = true;
      const db = this.db || getFirestore(app);
      getDoc(doc(db, 'supportRequests', req.id)).then((docSnap) => {
        if (docSnap.exists()) {
          this.messageModalContent = docSnap.data().message || '';
        } else {
          this.messageModalContent = 'Message not found.';
        }
      }).catch(() => {
        this.messageModalContent = 'Failed to load message.';
      });
    },
    closeMessageModal() {
      this.showMessageModal = false;
      this.messageModalContent = '';
    },
    openResolveModal(req) {
      this.resolveTarget = req;
      this.showResolveModal = true;
    },
    closeResolveModal() {
      this.showResolveModal = false;
      this.resolveTarget = null;
    },
    async confirmResolve() {
      if (!this.resolveTarget) return;
      try {
        await updateDoc(doc(this.db, 'supportRequests', this.resolveTarget.id), {
          status: 'resolved'
        });
        await this.fetchSupportRequests();
        this.closeResolveModal();
      } catch (e) {
        alert('Failed to update status.');
        this.closeResolveModal();
      }
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
/* Layout */
.container {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Sidebar */
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

.sidebar-nav .material-icons {
  margin-right: 8px;
  font-size: 18px;
}

.sidebar-nav h3 {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Main Content */
main {
  position: fixed;
  left: 240px;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
  padding: 0 var(--card-padding) var(--card-padding) var(--card-padding);
  overflow-y: auto;
  height: 100vh;
  margin-left: 10px;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 24px 0;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-light);
  position: relative;
}

.main-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--color-dark);
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

/* Support Stats */
.support-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.card {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 87, 34, 0.1);
}

.card .material-icons {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-size: 32px;
  color: var(--color-white);
}

.card-content {
  flex-grow: 1;
  position: relative;
}

.card-content h3 {
  color: var(--color-dark-variant);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-content h1 {
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

.card-content small {
  color: var(--color-dark-variant);
  font-size: 0.85rem;
  display: block;
}

/* User Support Requests Section */
.support-requests {
  margin-bottom: 32px;
}

.support-requests h2 {
  color: var(--color-dark);
  font-size: 1.5rem;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-primary-light);
}

.ticket-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
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

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-dark);
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  border-spacing: 0 6px;
  border-collapse: separate;
}

thead tr {
  background-color: var(--color-light-variant);
}

th, td {
  padding: 16px 18px;
  text-align: left;
  color: var(--color-dark-variant);
  font-weight: 600;
  vertical-align: middle;
}

tbody tr {
  height: 56px;
  transition: background 0.2s;
}

tbody tr:hover {
  background-color: #f7f7fa;
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

  .support-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .ticket-filters {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .filter-group {
    grid-column: span 1;
  }

  .search-group {
    grid-column: span 2;
  }
}

@media screen and (max-width: 768px) {
  .container {
    display: block;
    min-height: 100vh;
  }
  
  main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0 16px 16px 16px;
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  #sidebar {
    position: fixed;
    transform: translateX(-100%);
    width: 280px;
    z-index: 1000;
  }
  
  #sidebar.show {
    transform: translateX(0);
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
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 8px;
    margin: 0;
    z-index: 100;
  }

  .main-header {
    padding: 48px 0 4px 0;  /* Top padding to account for menu button */
    margin: 0 0 16px 0;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .main-header h1 {
    text-align: left;
    margin: 0;
    font-size: 1.5rem;
    width: 100%;
  }

  .current-datetime {
    display: none;
  }

  .support-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .ticket-filters {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-group,
  .search-group {
    grid-column: span 1;
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

  .faq-section {
    padding: 16px;
  }

  .faq-question h3 {
    font-size: 1rem;
    padding-right: 32px;
  }

  .faq-answer {
    font-size: 0.95rem;
  }
}

@media screen and (max-width: 480px) {
  main {
    padding: 0 12px 12px 12px;
  }

  .menu-toggle {
    top: 6px;
    left: 6px;
    padding: 6px;
  }

  .main-header {
    padding: 44px 0 4px 0;  /* Slightly reduced top padding for smaller screens */
  }

  .main-header h1 {
    font-size: 1.25rem;
    margin-left: 0;
  }

  .support-stats {
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-content h1 {
    font-size: 1.5rem;
  }

  .stat-content h3 {
    font-size: 0.9rem;
  }

  .ticket-filters {
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

  .status-badge {
    padding: 4px 8px;
    font-size: 0.8rem;
  }

  .modal-content {
    padding: 16px;
    margin: 12px;
  }

  .faq-section {
    padding: 12px;
  }

  .faq-question h3 {
    font-size: 0.95rem;
  }

  .faq-answer {
    font-size: 0.9rem;
  }

  .faq-question,
  .faq-item.active .faq-answer {
    padding: 12px;
  }
}

/* Add smooth transitions for all responsive changes */
#sidebar,
main,
.main-header,
.support-stats,
.ticket-filters,
.table-wrapper,
.modal-content,
.faq-section {
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

/* FAQ specific styles */
.faq-question {
  position: relative;
  cursor: pointer;
  padding: 16px;
  background: var(--color-white);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.faq-question:hover {
  background: var(--color-light);
}

.faq-question::after {
  content: 'expand_more';
  font-family: 'Material Icons';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}

.faq-item.active .faq-question::after {
  transform: translateY(-50%) rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: var(--color-light);
  border-radius: 0 0 8px 8px;
}

.faq-item.active .faq-answer {
  max-height: 500px;
  padding: 16px;
}

/* Add styles for status, modal, and icons */
.status-active {
  color: #ff9800;
  font-weight: bold;
}
.status-resolved {
  color: #4caf50;
  font-weight: bold;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 2px;
  vertical-align: middle;
}
.eye-icon {
  font-size: 18px;
  color: #222;
  vertical-align: middle;
}
.action-btn {
  background: #4caf50;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(76,175,80,0.08);
}
.action-btn .material-icons {
  color: #fff;
  font-size: 22px;
}
.action-btn:hover {
  background: #388e3c;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.centered-modal {
  background: #fff;
  padding: 20px 16px;
  border-radius: 12px;
  min-width: 220px;
  max-width: 320px;
  max-height: 60vh;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  text-align: center;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  color: #222 !important;
}
.centered-modal h3,
.centered-modal p,
.centered-modal span,
.centered-modal div {
  color: #222 !important;
}
.close-modal-btn {
  margin-top: 18px;
  background: #ff9800;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 8px;
}
.resolve-btn {
  margin-top: 18px;
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 8px;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
