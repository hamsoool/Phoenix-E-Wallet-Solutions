<template>
  <div style="text-align:center; margin-top: 60px;">
    <h2>Processing Deposit...</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

export default {
  data() {
    return {
      message: 'Verifying deposit...'
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');
    const userIdFromUrl = urlParams.get('userId');

    if (!transactionId || !userIdFromUrl) {
      this.message = 'Invalid deposit information.';
      console.error('Missing transactionId or userId in URL');
      setTimeout(() => {
        this.$router.push('/dashboard');
      }, 3000);
      return;
    }

    const db = getFirestore(app);
    const transactionRef = doc(db, "transactions", transactionId);

    try {
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        this.message = 'Deposit transaction not found.';
        console.error('Deposit transaction not found for ID:', transactionId);
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 3000);
        return;
      }

      const transactionData = transactionSnap.data();

      // Verify that the transaction belongs to the user from the URL
      if (transactionData.userId !== userIdFromUrl) {
        this.message = 'Deposit verification failed.';
        console.error('Transaction userId mismatch. Expected:', userIdFromUrl, 'Got:', transactionData.userId);
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 3000);
        return;
      }

      // Only process if the transaction is pending
      if (transactionData.status === 'Pending') {
        const userRef = doc(db, "users", userIdFromUrl);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const currentBalance = Number(userSnap.data().walletBalance || 0);
          const depositAmount = Number(transactionData.amount);
          const newBalance = currentBalance + depositAmount;

          // Update wallet balance in user document
          await updateDoc(userRef, {
            walletBalance: newBalance
          });
          console.log('Wallet updated!');

          // Update transaction status to complete and record new balance
          await updateDoc(transactionRef, {
            status: 'Transaction Complete',
            description: `Deposited ₱${depositAmount.toFixed(2)} to wallet`,
            walletBalance: newBalance,
            previousWalletBalance: currentBalance // Store previous balance for history clarity
          });
          console.log('Transaction updated to Complete!');

          this.message = 'Deposit Successful!';
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 2000);

        } else {
          this.message = 'User account not found.';
          console.error('User document not found for UID:', userIdFromUrl);
          // Update transaction status to Failed as user document is missing
           await updateDoc(transactionRef, { status: 'Failed', description: 'User account not found for deposit.' });
           setTimeout(() => {
             this.$router.push('/dashboard');
           }, 3000);
        }

      } else {
         this.message = `Deposit already processed (Status: ${transactionData.status}).`;
         console.warn(`Transaction ${transactionId} already processed with status: ${transactionData.status}`);
         setTimeout(() => {
           this.$router.push('/dashboard');
         }, 3000);
      }

    } catch (error) {
      this.message = 'An error occurred during deposit processing.';
      console.error('Error processing deposit success:', error);
      // Attempt to mark the transaction as failed on error
      if(transactionSnap && transactionSnap.exists()) {
         await updateDoc(transactionRef, { status: 'Failed', description: 'Error during deposit processing.' });
      }
      setTimeout(() => {
        this.$router.push('/dashboard');
      }, 3000);
    }
  }
}
</script>
