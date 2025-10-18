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

      <!-- Members Content -->
      <div v-if="currentPage === 'members'">
        <!-- Member Management Section -->
        <section class="member-management">
          <div class="section-header">
            <div class="header-left">
              <h2>Member Management</h2>
              <span class="member-count" v-if="filteredMembers.length > 0">
                {{ filteredMembers.length }} member{{ filteredMembers.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="header-right">
              <button class="add-member-btn" @click="showAddMemberModal = true">
                <span class="material-icons">person_add</span>
                Add New Member
              </button>
            </div>
          </div>

          <!-- Member Filters -->
          <div class="member-filters">
            <div class="filter-grid">
              <div class="filter-group">
                <label for="memberType">
                  <span class="material-icons">category</span>
                  Member Type
                </label>
                <div class="select-wrapper">
                  <select id="memberType" v-model="filters.type" class="filter-select" @change="applyFilters">
                    <option value="">All Types</option>
                    <option value="Half-Winged Phoenix">Half-Winged Phoenix</option>
                    <option value="Phoenix">Phoenix</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>
              </div>
              <div class="filter-group">
                <label for="collegeYear">
                  <span class="material-icons">school</span>
                  College Year
                </label>
                <div class="select-wrapper">
                  <select id="collegeYear" v-model="filters.collegeYear" class="filter-select" @change="applyFilters">
                    <option value="">All Years</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              </div>
              <div class="filter-group search-group">
                <label for="searchMember">
                  <span class="material-icons">search</span>
                  Search
                </label>
                <div class="search-wrapper">
                  <input 
                    type="text" 
                    id="searchMember" 
                    v-model="filters.search" 
                    placeholder="Search by name or email"
                    class="search-input"
                    @input="applyFilters"
                  >
                </div>
              </div>
            </div>
            <div class="filter-footer">
              <button class="reset-btn" @click="resetFilters" :disabled="!hasActiveFilters">
                <span class="material-icons">refresh</span>
                Reset Filters
              </button>
            </div>
          </div>

          <!-- Members Table -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Type</th>
                  <th>Join Date</th>
                  <th>Year</th>
                  <th>Block</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredMembers.length === 0">
                  <td colspan="7" style="text-align:center; color:#888; font-size:1.1rem; padding: 32px 0;">
                    No records can be found
                  </td>
                </tr>
                <tr v-for="member in filteredMembers" :key="member.id">
                  <td>
                    <div class="member-info">
                      <div class="member-avatar">
                        <img v-if="member.avatar" :src="member.avatar" alt="Member Avatar">
                        <span v-else class="material-icons" style="font-size: 40px; color: #ccc;">account_circle</span>
                      </div>
                      <div class="member-details">
                        <span class="member-name">{{ member.name }}</span>
                        <span class="member-email">{{ member.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span :class="['type-badge', 'type-' + member.type.toLowerCase().replace(/ /g, '-')]"><span class="material-icons type-icon">{{ member.type === 'Phoenix' ? 'stars' : (member.type === 'Half-Winged Phoenix' ? 'star_half' : 'person') }}</span> {{ member.type }}</span>
                  </td>
                  <td>
                    <div class="date-info">
                      <span class="date">{{ formatShortDate(member.joinDate) }}</span>
                      <span class="time">{{ formatShortTime(member.joinDate) }}</span>
                    </div>
                  </td>
                  <td>{{ member.collegeYear || '-' }}</td>
                  <td>{{ member.block || '-' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="icon-btn" @click="viewDetails(member)" title="View Details">
                        <span class="material-icons">visibility</span>
                      </button>
                      <button class="icon-btn danger" @click="confirmDeleteUser(member)" title="Delete User">
                        <span class="material-icons">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Add Member Modal -->
        <div v-if="showAddMemberModal" class="modal">
          <div class="modal-backdrop" @click="closeAddMemberModal"></div>
          <div class="modal-content">
            <h2>Add New Member</h2>
            <form @submit.prevent="handleRegistration">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="newMember.firstName" 
                  required
                >
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="newMember.lastName" 
                  required
                >
              </div>
              <div class="form-group">
                <label for="memberEmail">Gordon College Email</label>
                <input 
                  type="email" 
                  id="memberEmail" 
                  v-model="newMember.email" 
                  required
                >
                <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label for="collegeYear">College Year</label>
                  <select id="collegeYear" v-model="newMember.collegeYear" required>
                    <option value="" disabled selected>Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
                <div class="form-group half">
                  <label for="block">Block</label>
                  <input
                    type="text"
                    id="block"
                    v-model="newMember.block"
                    maxlength="1"
                    pattern="[A-F]"
                    @input="onBlockInput"
                    placeholder="A-F"
                    required
                  >
                  <span v-if="formErrors.block" class="error-message">{{ formErrors.block }}</span>
                </div>
              </div>
              <div class="form-group">
                <label for="memberType">Member Type</label>
                <select id="memberType" v-model="newMember.type" required>
                  <option value="Regular">Regular</option>
                  <option value="Half-Winged Phoenix">Half-Winged Phoenix</option>
                  <option value="Phoenix">Phoenix</option>
                </select>
              </div>
              <div class="modal-buttons">
                <button type="button" class="cancel-btn" @click="closeAddMemberModal">Cancel</button>
                <button type="submit" class="submit-btn">Add Member</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="modal">
          <div class="modal-backdrop"></div>
          <div class="modal-content success">
            <div class="success-icon">
              <span class="material-icons">check_circle</span>
            </div>
            <h2>Member Added Successfully</h2>
            <div class="modal-buttons">
              <button class="submit-btn" @click="closeSuccessModal">OK</button>
            </div>
          </div>
        </div>

        <!-- Member Details Modal -->
        <div v-if="showMemberDetails" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-content member-details-modal">
              <div class="modal-icon" style="margin-bottom: 0;">
                <img v-if="selectedMember.avatar" :src="selectedMember.avatar" alt="Avatar" class="member-avatar-large" />
                <span v-else class="material-icons member-avatar-large" style="font-size: 90px; color: #ccc; display: flex; align-items: center; justify-content: center;">account_circle</span>
              </div>
              <h2 class="modal-title">{{ selectedMember.name }}</h2>
              <div class="member-details-list">
                <div class="member-detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ selectedMember.email }}</span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Member Type:</span>
                  <span :class="['type-badge', 'type-' + selectedMember.type.toLowerCase().replace(/ /g, '-')]"><span class="material-icons type-icon">{{ selectedMember.type === 'Phoenix' ? 'stars' : (selectedMember.type === 'Half-Winged Phoenix' ? 'star_half' : 'person') }}</span> {{ selectedMember.type }}</span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Year:</span>
                  <span class="detail-value">{{ selectedMember.collegeYear || '-' }}</span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Block:</span>
                  <span class="detail-value">{{ selectedMember.block || '-' }}</span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Join Date:</span>
                  <span class="detail-value">
                    {{ formatDate(selectedMember.joinDate) }}
                    <span class="detail-time">{{ formatTime(selectedMember.joinDate) }}</span>
                  </span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Last Active:</span>
                  <span class="detail-value">
                    {{ formatDate(selectedMember.lastActive) }}
                    <span class="detail-time">{{ formatTime(selectedMember.lastActive) }}</span>
                  </span>
                </div>
                <div class="member-detail-row">
                  <span class="detail-label">Additional Info:</span>
                  <span class="detail-value" style="white-space: pre-line;">{{ selectedMember.additionalInfo || 'No additional information' }}</span>
                </div>
              </div>
              <div class="modal-actions">
                <button class="modal-button confirm" @click="closeMemberDetails">Close</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal-overlay" v-if="showDeleteModal">
          <div class="modal-container">
            <div class="modal-content">
              <div class="modal-icon">
                <i class='bx bx-error'></i>
              </div>
              <h3>Delete User?</h3>
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              <div class="modal-buttons">
                <button class="modal-button cancel" @click="cancelDeleteUser">Cancel</button>
                <button class="modal-button confirm" @click="deleteUserConfirmed">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Alert Modal -->
        <div class="modal-overlay" v-if="showAlertModal">
          <div class="modal-container">
            <div class="modal-content">
              <div class="modal-icon">
                <i :class="alertType === 'success' ? 'bx bx-check-circle' : 'bx bx-error'"></i>
              </div>
              <h3>{{ alertType === 'success' ? 'Success!' : 'Error' }}</h3>
              <p>{{ alertMessage }}</p>
              <div class="modal-buttons">
                <button class="modal-button confirm" @click="showAlertModal = false">OK</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';
import { useRouter } from 'vue-router';
import bcrypt from 'bcryptjs';

export default {
  name: 'OfficialMembers',
  data() {
    return {
      isSidebarOpen: false,
      currentPage: 'members',
      members: [],
      showAddMemberModal: false,
      showMemberDetails: false,
      selectedMember: null,
      newMember: {
        firstName: '',
        lastName: '',
        email: '',
        collegeYear: '',
        block: '',
        type: 'Regular'
      },
      filters: {
        type: '',
        collegeYear: '',
        search: ''
      },
      minDate: '2020-01-01',
      maxDate: new Date().toISOString().split('T')[0],
      pageTitles: {
        dashboard: 'Admin Dashboard',
        elites: 'Elite Members',
        history: 'Admin History',
        members: 'Official Members',
        help: 'Help & Support'
      },
      now: new Date(),
      showDeleteModal: false,
      userToDelete: null,
      showAlertModal: false,
      alertMessage: '',
      alertType: 'success',
      showSuccessModal: false,
      formErrors: {
        email: '',
        block: ''
      }
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
    filteredMembers() {
      let filtered = [...this.members];
      if (this.filters.type) {
        filtered = filtered.filter(member => member.type === this.filters.type);
      }
      if (this.filters.collegeYear) {
        filtered = filtered.filter(member => member.collegeYear === this.filters.collegeYear);
      }
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        filtered = filtered.filter(member => 
          member.name.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower)
        );
      }
      return filtered;
    },
    hasActiveFilters() {
      return this.filters.type || 
             this.filters.collegeYear || 
             this.filters.search;
    },
    hasFilterChanges() {
      return this.filters.type !== this.previousFilters.type ||
             this.filters.collegeYear !== this.previousFilters.collegeYear ||
             this.filters.search !== this.previousFilters.search;
    },
    previousFilters() {
      return {
        type: this.filters.type,
        collegeYear: this.filters.collegeYear,
        search: this.filters.search
      };
    },
    isDateInRange() {
      return (date, startDate, endDate) => {
        if (!date) return false;
        const checkDate = date.toDate ? date.toDate() : new Date(date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) {
          return checkDate >= start && checkDate <= end;
        } else if (start) {
          return checkDate >= start;
        } else if (end) {
          return checkDate <= end;
        }
        return true;
      };
    }
  },
  async created() {
    this.auth = getAuth(app);
    this.db = getFirestore(app);
    this.router = useRouter();
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.user = user;
        await this.fetchMemberData();
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
    async fetchMemberData() {
      try {
        const membersSnapshot = await getDocs(collection(this.db, 'users'));
        const now = new Date();
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
        this.members = membersSnapshot.docs
          .map(doc => {
            const data = doc.data();
            let status = 'inactive';
            if (data.membershipExpiry && data.membershipExpiry.toDate && data.membershipExpiry.toDate() > now) {
              status = 'active';
            }
            if (data.status === 'suspended') status = 'suspended';
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
              name: data.name || data.fullName || ((data.firstName && data.lastName) ? `${data.firstName} ${data.lastName}` : 'No Name'),
              email: data.email || '',
              avatar: data.avatarUrl || '',
              type: data.membershipType === 'fullYear' ? 'Phoenix' : (data.membershipType === 'semester' ? 'Half-Winged Phoenix' : 'Regular'),
              joinDate: data.membershipStart || data.joinDate || null,
              lastActive: data.lastActive || null,
              status,
              additionalInfo: data.additionalInfo || '',
              collegeYear: data.collegeYear || null,
              block: data.block || null,
              amount
            };
          });
      } catch (error) {
        console.error('Error fetching member data:', error);
      }
    },
    formatDateTime(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
    editMember(member) {
      // Implement edit functionality if needed
      console.log('Edit member:', member);
    },
    viewDetails(member) {
      this.selectedMember = member;
      this.showMemberDetails = true;
    },
    closeAddMemberModal() {
      this.showAddMemberModal = false;
      this.newMember = {
        firstName: '',
        lastName: '',
        email: '',
        collegeYear: '',
        block: '',
        type: 'Regular'
      };
    },
    closeMemberDetails() {
      this.showMemberDetails = false;
      this.selectedMember = null;
    },
    applyFilters() {
      // No need to fetch data, just triggers computed property
    },
    resetFilters() {
      this.filters.type = '';
      this.filters.collegeYear = '';
      this.filters.search = '';
      this.applyFilters();
    },
    async toggleMemberStatus(member) {
      const newStatus = member.status === 'active' ? 'suspended' : 'active';
      const confirmMessage = newStatus === 'suspended' 
        ? `Are you sure you want to suspend ${member.name}?`
        : `Are you sure you want to activate ${member.name}?`;
      if (confirm(confirmMessage)) {
        try {
          await updateDoc(doc(this.db, 'users', member.id), {
            status: newStatus
          });
          await this.fetchMemberData();
        } catch (error) {
          console.error('Error updating member status:', error);
          alert('Error updating member status. Please try again.');
        }
      }
    },
    confirmDeleteUser(member) {
      this.userToDelete = member;
      this.showDeleteModal = true;
    },
    async deleteUserConfirmed() {
      if (!this.userToDelete) return;
      try {
        await deleteDoc(doc(this.db, "users", this.userToDelete.id));
        this.showDeleteModal = false;
        this.userToDelete = null;
        await this.fetchMemberData();
        this.alertType = 'success';
        this.alertMessage = 'User deleted successfully.';
        this.showAlertModal = true;
      } catch (error) {
        this.alertType = 'error';
        this.alertMessage = 'Error deleting user.';
        this.showAlertModal = true;
      }
    },
    cancelDeleteUser() {
      this.showDeleteModal = false;
      this.userToDelete = null;
    },
    validateGordonEmail(email) {
      const gordonEmailRegex = /^(\d{4})(\d{5})@gordoncollege\.edu\.ph$/;
      const match = email.match(gordonEmailRegex);
      
      if (!match) {
        return {
          isValid: false,
          error: 'Invalid email format. Must be a School Domain'
        };
      }

      const yearEnrolled = parseInt(match[1]);
      const currentYear = new Date().getFullYear();
      
      if (yearEnrolled < currentYear - 4 || yearEnrolled > currentYear) {
        return {
          isValid: false,
          error: 'Invalid enrollment year'
        };
      }

      return {
        isValid: true,
        yearEnrolled: yearEnrolled,
        studentId: match[2]
      };
    },
    onBlockInput(e) {
      let val = e.target.value.toUpperCase();
      if (!/^[A-F]?$/.test(val)) {
        val = val.replace(/[^A-F]/g, '');
      }
      this.newMember.block = val;
      if (val && !/^[A-F]$/.test(val)) {
        this.formErrors.block = 'Block must be a letter from A to F';
      } else {
        this.formErrors.block = '';
      }
    },
    async handleRegistration() {
      // Reset form errors
      this.formErrors = {
        email: '',
        block: ''
      };

      // Basic validation
      if (!this.newMember.firstName || !this.newMember.lastName || !this.newMember.email || 
          !this.newMember.collegeYear || !this.newMember.block) {
        this.showAlert('Please fill in all fields', 'error');
        return;
      }

      // Validate Gordon College email
      const emailValidation = this.validateGordonEmail(this.newMember.email);
      if (!emailValidation.isValid) {
        this.formErrors.email = emailValidation.error;
        return;
      }

      try {
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Create user with email and default password
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.newMember.email,
          '123456' // Default password
        );

        // Immediately sign out the newly created user
        await auth.signOut();

        // Create a custom token for face recognition login
        const customToken = await auth.currentUser.getIdToken();

        // Hash the default password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('123456', salt);
        
        const fullStudentId = `${emailValidation.yearEnrolled}${emailValidation.studentId}`;
        
        // Create user document with all required fields
        const userData = {
          firstName: this.newMember.firstName,
          lastName: this.newMember.lastName,
          email: this.newMember.email,
          studentId: fullStudentId,
          yearEnrolled: emailValidation.yearEnrolled,
          studentIdShort: emailValidation.studentId,
          createdAt: new Date().toISOString(),
          walletBalance: 0,
          gameBalance: 0,
          isVerified: true,
          customToken: customToken,
          isAdmin: false,
          isPaid: false,
          paymentType: 'none',
          passwordHash: hashedPassword,
          phone: '',
          dob: '',
          avatarUrl: '',
          joinDate: serverTimestamp(),
          lastActive: serverTimestamp(),
          collegeYear: this.newMember.collegeYear,
          block: this.newMember.block,
          type: this.newMember.type
        };

        // Save to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), userData);

        // Show success modal
        this.showSuccessModal = true;
        
        // Reset the form
        this.newMember = {
          firstName: '',
          lastName: '',
          email: '',
          collegeYear: '',
          block: '',
          type: 'Regular'
        };

        // Refresh member list
        await this.fetchMemberData();

      } catch (error) {
        console.error("Registration error:", error);
        this.showAlert('Error registering member: ' + error.message, 'error');
      }
    },
    closeSuccessModal() {
      this.showSuccessModal = false;
      this.closeAddMemberModal();
    },
    showAlert(message, type = 'success') {
      this.alertMessage = message;
      this.alertType = type;
      this.showAlertModal = true;
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
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-light);
  position: relative;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark);
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
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

.member-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
  padding: 0;
}

.stat-card {
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

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.05), rgba(255, 87, 34, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 87, 34, 0.2);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
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
}

.stat-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(-5deg);
}

.stat-card:hover .stat-icon::after {
  opacity: 1;
}

.stat-icon .material-icons {
  font-size: 32px;
  color: var(--color-white);
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon .material-icons {
  transform: scale(1.1);
}

.stat-content {
  flex-grow: 1;
  position: relative;
}

.stat-content h3 {
  color: var(--color-dark-variant);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.stat-content h1 {
  color: var(--color-dark);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.2;
  transition: color 0.3s ease;
  background: linear-gradient(135deg, var(--color-dark), var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-content small {
  color: var(--color-dark-variant);
  font-size: 0.85rem;
  display: block;
  transition: color 0.3s ease;
}

.stat-card:hover .stat-content h3,
.stat-card:hover .stat-content small {
  color: var(--color-primary);
}

.stat-icon.half-winged {
  background: linear-gradient(135deg, #ff6a00, #ff9e40);
  box-shadow: 0 4px 15px rgba(255, 106, 0, 0.2);
}

.stat-icon.phoenix {
  background: linear-gradient(135deg, #ff3d00, #ff6a00);
  box-shadow: 0 4px 15px rgba(255, 61, 0, 0.2);
}

.member-management {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
  display: flex;
  gap: 1rem;
}

.add-member-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-member-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.add-member-btn .material-icons {
  font-size: 1.25rem;
}

.member-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.member-filters {
  background-color: var(--color-white);
  padding: 24px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 24px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
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

.date-range-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
  grid-column: span 2;
}

.date-input-group {
  flex: 1;
  position: relative;
}

.date-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-dark);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-group {
  grid-column: span 2;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 48px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-dark);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--color-light);
}

.reset-btn,
.apply-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
}

.reset-btn {
  background-color: var(--color-light);
  color: var(--color-dark-variant);
}

.apply-btn {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.reset-btn:hover:not(:disabled),
.apply-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.reset-btn:disabled,
.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.table-wrapper {
  overflow-x: auto;
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background-color: var(--color-light-variant);
}

th {
  padding: 16px;
  text-align: left;
  color: var(--color-dark);
  font-weight: 600;
  font-size: 0.9rem;
}

td {
  padding: 16px;
  color: var(--color-dark-variant);
  border-bottom: 1px solid var(--color-light);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  font-weight: 500;
  color: var(--color-dark);
}

.member-email {
  font-size: 0.85rem;
  color: var(--color-dark-variant);
}

.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.type-badge .type-icon,
.status-badge .status-icon {
  font-size: 1rem;
}

.type-regular {
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
  color: #666;
  border: 1px solid #e0e0e0;
}

.type-phoenix {
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 87, 34, 0.2));
  color: var(--color-primary);
  border: 1px solid rgba(255, 87, 34, 0.2);
}

.type-half-winged-phoenix {
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.1), rgba(255, 165, 0, 0.2));
  color: #ff6a00;
  border: 1px solid rgba(255, 165, 0, 0.2);
}

.type-badge .type-icon {
  font-size: 1rem;
}

.status-active {
  background-color: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
}

.status-inactive {
  background-color: rgba(158, 158, 158, 0.1);
  color: #757575;
}

.status-pending {
  background-color: rgba(255, 152, 0, 0.1);
  color: #f57c00;
}

.status-suspended {
  background-color: rgba(211, 47, 47, 0.1);
  color: #c62828;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-info .date {
  font-weight: 500;
  color: var(--color-dark);
  font-size: 0.95rem;
}

.date-info .time {
  font-size: 0.85rem;
  color: var(--color-dark-variant);
}

.detail-group .date,
.detail-group .time {
  display: block;
  margin-bottom: 4px;
}

.detail-group .date {
  font-weight: 500;
  color: var(--color-dark);
  font-size: 1rem;
}

.detail-group .time {
  color: var(--color-dark-variant);
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-dark-variant);
  padding: 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background-color: var(--color-light);
  color: var(--color-primary);
}

.icon-btn.danger:hover {
  background-color: rgba(211, 47, 47, 0.1);
  color: #c62828;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: #ff6a00 !important;
  padding: 24px;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1001;
  color: #fff;
  max-width: 95vw;
  overflow-x: auto;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-primary-light, #f0f0f0);
  border-radius: 5px;
  font-size: 0.9rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.cancel-btn,
.confirm-btn,
.close-btn {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.cancel-btn {
  background-color: var(--color-light);
  color: var(--color-dark);
}

.confirm-btn,
.close-btn {
  
  color: black;
}

.cancel-btn:hover {
  background-color: var(--color-light-variant);
}

.confirm-btn:hover,
.close-btn:hover {
  background-color: var(--color-primary-light);
}

.details-content {
  margin-top: 20px;
}

.detail-group {
  margin-bottom: 16px;
}

.detail-group label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-dark-variant);
  margin-bottom: 4px;
}

.detail-group p {
  margin: 0;
  color: var(--color-dark);
}

.detail-group pre {
  background-color: var(--color-light-variant);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.date-range-wrapper {
  display: flex;
  gap: 8px;
  width: 100%;
}

.date-input-group {
  flex: 1;
  position: relative;
}

.date-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-dark);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  padding-right: 40px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-dark);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

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

  .member-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }

  .stat-content h1 {
    font-size: 1.75rem;
  }

  .filter-grid {
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

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 32px;
    left: 8px;
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

  .member-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-grid {
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

  .member-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .action-buttons {
    flex-wrap: wrap;
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
  }

  .menu-toggle {
    top: 20px;
    left: 6px;
  }

  .main-header {
    padding: 44px 0 4px 0;  /* Slightly reduced top padding for smaller screens */
    gap: 8px;
  }

  .main-header h1 {
    font-size: 1.25rem;
    margin-left: 0;
  }

  .member-stats {
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

  .filter-grid {
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
.member-stats,
.filter-grid,
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

.stat-icon.half-winged {
  background: linear-gradient(135deg, #ff6a00, #ff9e40);
}

.stat-icon.phoenix {
  background: linear-gradient(135deg, #ff3d00, #ff6a00);
}

.stat-card:hover .stat-icon.half-winged {
  transform: scale(1.05);
}

.stat-card:hover .stat-icon.phoenix {
  transform: scale(1.05);
}

.stat-icon {
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
}

/* Enhanced input styles to make text boxes bolder */
.form-group input,
.form-group select,
.form-group textarea,
.input-field,
.date-input,
.filter-input,
.filter-select {
  box-sizing: border-box;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  outline: none;
}

.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover,
.input-field:hover,
.date-input:hover,
.filter-input:hover,
.filter-select:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus,
.input-field:focus,
.date-input:focus,
.filter-input:focus,
.filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.form-group input.input-error,
.form-group select.input-error,
.form-group textarea.input-error,
.input-field.input-error,
.date-input.input-error,
.filter-input.input-error,
.filter-select.input-error {
  border-color: #ff3b30 !important;
  background-color: rgba(255, 59, 48, 0.05);
}

/* Password input specific styles */
.form-group input[type="password"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="password"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="password"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

/* Date input specific styles */
.form-group input[type="date"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="date"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="date"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

/* Email input specific styles */
.form-group input[type="email"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="email"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="email"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

/* Tel input specific styles */
.form-group input[type="tel"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="tel"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="tel"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

/* Text input specific styles */
.form-group input[type="text"] {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
}

.form-group input[type="text"]:hover {
  border-color: var(--color-primary);
}

.form-group input[type="text"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

/* Disabled input styles */
.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled,
.input-field:disabled,
.date-input:disabled,
.filter-input:disabled,
.filter-select:disabled {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Error message styles */
.error-message {
  color: #ff3b30;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  font-weight: 500;
}

/* Filter specific styles */
.filter-input,
.filter-select {
  border: 2px solid var(--color-primary-light, #f0f0f0);
  background: var(--color-white);
  font-weight: 500;
}

.filter-input:hover,
.filter-select:hover {
  border-color: var(--color-primary);
}

.filter-input:focus,
.filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.filter-input.input-error,
.filter-select.input-error {
  border-color: #ff3b30 !important;
  background-color: rgba(255, 59, 48, 0.05);
}

.select-wrapper,
.search-wrapper {
  position: relative;
  width: 100%;
}

.filter-select,
.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-primary-light, #f0f0f0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-dark);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.filter-select:hover,
.search-input:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.filter-select:focus,
.search-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 65, 54, 0.15);
}

.filter-select:focus::placeholder,
.search-input:focus::placeholder {
  color: var(--color-primary);
}

/* Add modern styles for the member details modal */
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

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group.half {
  flex: 1;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.modal-content.success {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  color: #28a745;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-icon .material-icons {
  font-size: 3rem;
}

.credentials-info {
  background: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.info-text {
  color: #666;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 2rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #218838;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 2rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background: #5a6268;
}
</style>
