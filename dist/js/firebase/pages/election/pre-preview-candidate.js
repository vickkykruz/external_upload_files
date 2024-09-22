import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage } from '../../../components/alertFunctions.js';

document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);

    if (userData) {
      document.getElementById('name').value = userData.name.toUpperCase();
      document.getElementById('memberId').value = userData.memberId.toUpperCase();
      document.getElementById('matricNo').value = userData.matricNo.toUpperCase();

    }

  } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('Error: ' + error);
  }
});
