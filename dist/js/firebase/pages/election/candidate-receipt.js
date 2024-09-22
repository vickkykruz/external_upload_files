import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage } from '../../../components/alertFunctions.js';
import { fetchPaymentData } from '../../../components/fetch-payment-data.js';
import { fetchCandidateData } from '../../../components/fetch-candidate-data.js';

// Function to extract URL parameters (uid and token)
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    reference: params.get('trxref')
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);
    const { reference } = getQueryParams();
    
    if (!reference) {
      showErrorMessage('Failed to fetch the payment ref.');
    }

    // Get the payments details
    const paymentsData = await fetchPaymentData(reference);
    const candidateData = await fetchCandidateData(uid);

    console.log('Payment Data:', paymentsData);
    console.log('User Data:', userData);
    console.log('Candidate: ', candidateData);
    if (userData && paymentsData) {
      const dateTime = paymentsData.paidAt;

      // Convert the string to a Date object
      const date = new Date(dateTime);

      // Extract the day, month, and year
      const day = ("0" + date.getDate()).slice(-2); // Add leading zero if necessary
      const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed, so add 1
      const year = date.getFullYear();

      // Format the date as MM/DD/YYYY
      const formattedDate = `${month}/${day}/${year}`;
      const newPaymentId = "NO: " + paymentsData.paymentId;
      const amount = paymentsData.amount;
      const formattedValue = (amount / 100).toFixed(2);
      const amtValue = "&#8358; " + formattedValue;
      const reference = paymentsData.reference;
      const lastSixChars = reference.slice(-7);
      document.getElementById('name').innerText = userData.name.toUpperCase();
      document.getElementById('paymentId').innerText = newPaymentId + ' | ';
      document.getElementById('date').innerText = formattedDate;
      document.getElementById('memberId').innerHTML = userData.memberId.toUpperCase();
      document.getElementById('address').innerHTML = userData.address.toUpperCase();
      document.getElementById('phoneNo').innerHTML = userData.phoneNo;
      document.getElementById('email').innerHTML = userData.email;
      document.getElementById('receiptId').innerHTML = lastSixChars;

      if (paymentsData.paymentPurpose === 'Election') {
        // Get the candidate data
        document.getElementById('paidItem').innerHTML = candidateData.role.toUpperCase();
        document.getElementById('purpose').innerHTML = paymentsData.paymentPurpose.toUpperCase();
      }

      document.getElementById('amt').innerHTML = amtValue;
      document.getElementById('price').innerHTML = amtValue;

      // Print the receipt 
      window.print();
    }
  } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('Error: ' + error);
  }
});
