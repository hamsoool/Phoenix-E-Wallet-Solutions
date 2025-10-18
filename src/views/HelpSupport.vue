<template>
  <div class="help-support">
    <div class="header">
      <h1>Help & Support</h1>
      <p>Get assistance with your account, gameplay, or technical issues</p>
    </div>

    <!-- FAQ Section -->
    <div class="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="faq-item"
          :class="{ 'active': faq.isOpen }"
        >
          <div class="faq-question" @click="toggleFAQ(index)">
            <h3>{{ faq.question }}</h3>
            <span class="material-icons">
              {{ faq.isOpen ? 'expand_less' : 'expand_more' }}
            </span>
          </div>
          <div class="faq-answer" v-show="faq.isOpen">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Request Box -->
    <div class="support-request-box">
      <h2>Submit a Support Request</h2>
      <form @submit.prevent="submitSupportRequest">
        <div class="form-group">
          <label for="supportSubject">Subject</label>
          <input id="supportSubject" v-model="supportForm.subject" type="text" required maxlength="100" />
        </div>
        <div class="form-group">
          <label for="supportIssueType">Issue Type</label>
          <select id="supportIssueType" v-model="supportForm.issueType" required>
            <option value="">Select Issue Type</option>
            <option value="Account">Account</option>
            <option value="Gameplay">Gameplay</option>
            <option value="Technical">Technical</option>
            <option value="Payment">Payment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="supportMessage">Message</label>
          <textarea id="supportMessage" v-model="supportForm.message" rows="4" required maxlength="1000"></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="supportLoading">Submit</button>
        </div>
        <div v-if="supportSuccess" class="support-success">Your request has been sent. Our team will get back to you soon.</div>
        <div v-if="supportError" class="support-error">{{ supportError }}</div>
      </form>
    </div>

    <!-- Contact Information -->
    <div class="contact-section">
      <h2>Contact Information</h2>
      <div class="contact-grid">
        <div class="contact-card">
          <span class="material-icons">email</span>
          <h3>Email Support</h3>
          <p>support@phoenix.com</p>
          <p class="response-time">Response within 24 hours</p>
        </div>
        <div class="contact-card">
          <span class="material-icons">schedule</span>
          <h3>Support Hours</h3>
          <p>Monday - Friday</p>
          <p>9:00 AM - 6:00 PM EST</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';

export default {
  name: 'HelpSupport',
  data() {
    return {
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'To create an account, click on the "Sign Up" button on the homepage. You\'ll need to provide your email address, create a password, and verify your email. Once verified, you can complete your profile with additional information.',
          isOpen: false
        },
        {
          question: 'What are the minimum system requirements?',
          answer: 'Our platform requires Windows 10 or later, 8GB RAM, and a stable internet connection. For optimal performance, we recommend 16GB RAM, a dedicated graphics card, and a high-speed internet connection.',
          isOpen: false
        },
        {
          question: 'How do I reset my password?',
          answer: 'If you\'ve forgotten your password, click the "Forgot Password" link on the login page. Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
          isOpen: false
        },
        {
          question: 'How do I update my profile information?',
          answer: 'To update your profile, go to the Profile section in your account settings. Click the edit button next to the information you want to change. Remember to save your changes before leaving the page.',
          isOpen: false
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept payment via PayMongo and ingame token ($ASH). All transactions are secure and encrypted for your protection.',
          isOpen: false
        },
        {
          question: 'How do I report a technical issue?',
          answer: 'If you encounter a technical issue, please submit a report to support request. Then, contact our support team via email with the details, including your account information and steps to reproduce the issue.',
          isOpen: false
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we take security seriously. All personal information is encrypted using industry-standard protocols. We never share your data with third parties without your consent, and we regularly update our security measures.',
          isOpen: false
        },
        {
          question: 'How do I cancel my subscription?',
          answer: 'To cancel your subscription, go to your Account Settings and select the Subscription tab. Click on "Cancel Subscription" and follow the prompts. Your access will continue until the end of your current billing period.',
          isOpen: false
        },
        {
          question: 'What should I do if I can\'t log in?',
          answer: 'If you\'re having trouble logging in, first check if your caps lock is on and ensure you\'re using the correct email address. If the problem persists, use the "Forgot Password" feature or contact our support team for assistance.',
          isOpen: false
        },
        {
          question: 'How do I enable two-factor authentication?',
          answer: 'To enable two-factor authentication, go to your Account Settings and select Security. Click on "Enable 2FA" and follow the setup instructions. You\'ll need to download an authenticator app and scan the QR code provided.',
          isOpen: false
        }
      ],
      supportForm: {
        subject: '',
        issueType: '',
        message: ''
      },
      supportLoading: false,
      supportSuccess: false,
      supportError: ''
    };
  },
  methods: {
    toggleFAQ(index) {
      this.faqs[index].isOpen = !this.faqs[index].isOpen;
    },
    async submitSupportRequest() {
      this.supportLoading = true;
      this.supportSuccess = false;
      this.supportError = '';
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const userEmail = user ? user.email : 'Anonymous';
        const db = getFirestore(app);
        await addDoc(collection(db, 'supportRequests'), {
          subject: this.supportForm.subject,
          issueType: this.supportForm.issueType,
          message: this.supportForm.message,
          userEmail,
          status: 'open',
          priority: 'medium',
          timestamp: serverTimestamp()
        });
        this.supportSuccess = true;
        this.supportForm.subject = '';
        this.supportForm.issueType = '';
        this.supportForm.message = '';
      } catch (e) {
        this.supportError = 'Failed to send request. Please try again.';
      } finally {
        this.supportLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.help-support {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: var(--color-dark);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header p {
  color: var(--color-dark-variant);
  font-size: 1.1rem;
}

.faq-section {
  margin-bottom: 3rem;
}

.faq-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-dark);
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: var(--color-white);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}

.faq-item:hover {
  transform: translateY(-2px);
}

.faq-question {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faq-question h3 {
  color: var(--color-dark);
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
  padding-right: 1rem;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  color: var(--color-dark-variant);
  line-height: 1.6;
}

.contact-section {
  margin-bottom: 3rem;
}

.contact-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-dark);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  background: var(--color-white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  text-align: center;
}

.contact-card .material-icons {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.contact-card h3 {
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.contact-card p {
  color: var(--color-dark-variant);
  margin-bottom: 0.5rem;
}

.response-time {
  font-size: 0.9rem;
  color: var(--color-info-dark);
}

@media screen and (max-width: 768px) {
  .help-support {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .faq-question h3 {
    font-size: 1rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }
}

.support-request-box {
  background: var(--color-white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.support-request-box h2 {
  margin-top: 0;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-dark-variant);
  font-weight: 500;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-light);
  border-radius: 5px;
  font-size: 1rem;
  color: var(--color-dark);
}
.form-actions {
  text-align: right;
}
.form-actions button {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.support-success {
  color: #28a745;
  margin-top: 1rem;
}
.support-error {
  color: #dc3545;
  margin-top: 1rem;
}
</style>