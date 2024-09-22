import { app } from '/src/firebase/firebase-config.js';
import { validateUserSession } from '../../components/firebase-session-auth.js';
import { logoutUser } from '../../components/logout-client.js';
import { showErrorMessage } from '../../components/alertFunctions.js';
import { fetchUserData } from '../../components/fetch-user-data.js';

document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);
    
    if (userData) {
      document.querySelectorAll(".sideName").forEach((element) => {
        element.textContent = userData.name;
      });
      document.querySelectorAll(".profileImage").forEach((element) => {
        element.src = userData.profileImageUrl;
      });

      document.getElementById('name').textContent = userData.name.toUpperCase();
      document.getElementById('program').textContent = userData.program.toUpperCase();
      document.getElementById('matricNo').textContent = userData.matricNo.toUpperCase();
      document.getElementById('department').textContent = userData.department.toUpperCase();
      document.getElementById('memberId').textContent = userData.memberId.toUpperCase();
      document.getElementById('accountType').textContent = userData.accountType.toUpperCase();
      document.getElementById('level').textContent = userData.level;
      document.getElementById('email').textContent = userData.email;
    }

    // Attach logout function to a button click event
    document.getElementById('logoutButton').addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      logoutUser();
    });
  } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('An error occurred while validating the session.');
  }
});