import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage, showSuccessMessage } from '../../../components/alertFunctions.js';
import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { fetchCsrfToken } from '../../../components/csrfTokenFetcher.js';
import { logoutUser } from '../../../components/logout-client.js';


document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);
    const currentYear = new Date().getFullYear();
    const db = getFirestore(app);
    const csrfToken = await fetchCsrfToken(); // Fetch the CSRF token

    if (userData) {
      document.querySelectorAll(".sideName").forEach((element) => {
        element.textContent = userData.name;
      });
      document.querySelectorAll(".profileImage").forEach((element) => {
        element.src = userData.profileImageUrl;
      });

     // Get the user from the vote record if the year is the year the disable link
     // Send request to check if the user has already voted
     const response = await fetch('http://localhost:4000/check-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ uid })
     });
    const result = await response.json();
    const voteButton = document.querySelector('.btn-vote');

    if (result.voted) {
      // User has already voted, disable the button and change the text
      voteButton.classList.add('disabled');
      voteButton.textContent = 'Voted';
    } else {
       const now = new Date();
       const voteDate = new Date(currentYear, 8, 25);
       if (now.getDate() === 25 && now.getMonth() === 8) { // Month is 0-indexed, so 8 means September
          // Show voting button if it's exactly September 25th
          voteButton.classList.remove('disabled');
          voteButton.textContent = 'Vote Candidate';
       } else {
          // Set up the timer if it's not September 25th
          const timerElement = document.getElementById('timer');
          const timeLeft = voteDate - now;
          startCountdown(timeLeft, timerElement);
          voteButton.classList.add('disabled');
       }
     }

   }

    // Attach logout function to a button click event
    document.getElementById('logoutButton').addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      logoutUser();
    });

   } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('Error: ' + error);
  }
});

// Countdown timer function
function startCountdown(timeLeft, timerElement) {
  const countdownInterval = setInterval(() => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    timerElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (timeLeft < 0) {
      clearInterval(countdownInterval);
      timerElement.textContent = "";
      // document.querySelector('.btn-success').classList.remove('disabled');
    }

    timeLeft -= 1000;
  }, 1000);
}
