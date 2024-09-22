import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage } from '../../../components/alertFunctions.js';
import { fetchCsrfToken } from '../../../components/csrfTokenFetcher.js';
import { processElectionPayment } from '../../../components/processElectionFormPayement.js';

document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);

    if (userData) {
      document.getElementById('name').value = userData.name.toUpperCase();
      const email = userData.email;
      const form = document.querySelector('.form');

      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const pka = e.target.querySelector('#pka').value.trim();
          const role = e.target.querySelector('#role').value.trim();
          const submitButton = e.target.querySelector('#submit');

          submitButton.disabled = true;
          submitButton.textContent = 'Processing...';

          if (!email || !pka || !role) {
            showErrorMessage('Please fill in all the fields.');
            submitButton.disabled = false; // Re-enable submit button
            submitButton.textContent = 'Submit';
            return;
          }

          try {
            const csrfToken = await fetchCsrfToken(); // Fetch the CSRF token
            // console.log('Fetched CSRF Token:', csrfToken);
            const response = await processElectionPayment(email, pka, role, uid, csrfToken);
            const result = await response.json();

            if (result.authorizationUrl) {
              window.location.href = result.authorizationUrl; // Use correct key
            } else {
              showErrorMessage(result.message || 'Failed to process payment.');
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            showErrorMessage('An error occurred during payment processing.');
          } finally {
            submitButton.disabled = false; // Always re-enable submit button
            submitButton.textContent = 'Get Candidate Form';
          }
        });
      }
    }
  } catch (error) {
    console.error('Error during session validation:', error);
    showErrorMessage('Error: '+ error);
  }
});
