import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage } from '../../../components/alertFunctions.js';

document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);

    if (userData) {
      document.querySelectorAll(".profileImage").forEach((element) => {
        element.src = userData.profileImageUrl;
      });

      document.getElementById('name').value = userData.name.toUpperCase();
      document.getElementById('memberId').value = userData.memberId.toUpperCase();
      document.getElementById('matricNo').value = userData.matricNo.toUpperCase();
      document.getElementById('program').value = userData.program.toUpperCase();
      document.getElementById('department').value = userData.department.toUpperCase();
      document.getElementById('level').value = userData.level;
      document.getElementById('email').value = userData.email;
      document.getElementById('phoneNo').value = userData.phoneNo;
      document.getElementById('dob').value = userData.dob;
      document.getElementById('gender').value = userData.gender;
      document.getElementById('state').value = userData.state;
      document.getElementById('address').value = userData.address;

    }

  } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('Error: ' + error);
  }
});
