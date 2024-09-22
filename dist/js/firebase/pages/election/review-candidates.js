import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { showErrorMessage, showSuccessMessage } from '../../../components/alertFunctions.js';
import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { selectedCandidate } from '../../../components/selected-candidate.js';
import { fetchCsrfToken } from '../../../components/csrfTokenFetcher.js';
import { logoutUser } from '../../../components/logout-client.js';

document.addEventListener('DOMContentLoaded', async () => {
  // When the page loads, check if the user is authenticated and set the input field
  try {
    const uid = await validateUserSession(); // Call validateUserSession and await the result
    const userData = await fetchUserData(uid);
    const currentYear = new Date().getFullYear();
    const db = getFirestore(app);

    if (userData) {
      document.querySelectorAll(".sideName").forEach((element) => {
        element.textContent = userData.name;
      });
      document.querySelectorAll(".profileImage").forEach((element) => {
        element.src = userData.profileImageUrl;
      });

      // Fetch selected candidates from the backend
      const response = await fetch('http://localhost:4000/selected-candidates', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch selected candidates');
      }
      const selectedCandidates = await response.json();

      // Fetch the candidates
      const candidatePositions = {
      	President: 'President',
      	'Vice President': 'Vice President',
      	'General Secretary': 'General Secretary',
      	'Assistant General Secretary': 'Assistant General Secretary',
      	Treasurer: 'Treasurer',
      	'Director Of Finance': 'Director Of Finance',
      	'Welfare Director': 'Welfare Director',
      	'Social Director': 'Social Director',
      	'Assistant Social Director': 'Assistant Social Director',
      	'Librarian/Resource Officer': 'Librarian/Resource Officer',
      	Auditor: 'Auditor',
      	'Public Relation Officer 1': 'Public Relation Officer 1',
      	'Public Relation Officer 2': 'Public Relation Officer 2',
      	'Sport Director': 'Sport Director',
      	'Assistant Sport Director': 'Assistant Sport Director'
      };

      for (const position of Object.keys(candidatePositions)) {
         const candidateUid = selectedCandidates[position];

         if (candidateUid) {
            try {
               const candidateInfo = await fetchUserData(candidateUid); // Custom function to fetch candidate info

               // Create candidate card dynamically and append to the row
               const candidateCard = `
               <div class="col-lg-6 col-md-6 col-sm-12">
                  <div class="card card-success card-outline mb-4">
                     <div class="card-header">
                        <div class="card-title">Selected Candidate For ${position}</div>
                     </div>
                     <div class="card-body">
                        <div class="candidate-container text-center">
                          <img src="${candidateInfo.profileImageUrl}" width="200" class="img-fluid mt-2 mb-2" style="border-radius: 10px;" alt="candidate-img" />
                          <h4>${candidateInfo.name}</h4>
                          <small><b>P.K.A:</b> ${candidateInfo.nickname}</small>
                        </div>
                     </div>
                     <div class="card-footer text-center">
                        <h5 class="mt-1 mb-1">Selected Candidate</h5>
                     </div>
                   </div>
               </div>
               `;

               document.querySelector('.selectedCandidates').insertAdjacentHTML('beforeend', candidateCard);
            } catch (error) {
                console.error(`Failed to fetch candidate data for ${position}:`, error);
            }
         }
      }

      document.querySelector('.submit-vote').addEventListener('click', async (event) => {
         event.preventDefault(); // Prevent default behavior

         try {
             const csrfToken = await fetchCsrfToken(); // Fetch the CSRF token

             // Send the request to the server to store the vote
            const voteResponse = await fetch('http://localhost:4000/submit-vote', {
              method: 'POST',
              headers: {
                 'Content-Type': 'application/json',
                 'CSRF-Token': csrfToken,
              },
              credentials: 'include',
              body: JSON.stringify({ uid }), // Send the UID in the request body
            });

            if (voteResponse.ok) {
               const result = await voteResponse.json();
               console.log('Vote submitted successfully:', result);
               // Show success toast/notification
               showSuccessMessage('Vote submitted successfully');
               setTimeout(() => {
                window.location.href = '../vote/index.html';
              }, 2500);
            } else {
               throw new Error('Failed to submit vote');
            }
         } catch (error) {
            console.error('Error submitting vote:', error);
            // Show error toast/notification
            showErrorMessage('Error: ', error);
         }
      });
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
