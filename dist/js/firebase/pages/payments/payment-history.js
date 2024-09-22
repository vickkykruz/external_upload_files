import { app } from '/src/firebase/firebase-config.js';
import { validateUserSession } from '../../../components/firebase-session-auth.js';
import { logoutUser } from '../../../components/logout-client.js';
import { showErrorMessage } from '../../../components/alertFunctions.js';
import { fetchUserData } from '../../../components/fetch-user-data.js';
import { fetchPaymentRecords, getTotalPaymentRecords } from '../../../components/fetch-user-payment-records.js';

document.addEventListener('DOMContentLoaded', async () => {
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

      handlePagination(uid, 1, 10); // Load the first page of payments with 10 items per page
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

async function handlePagination(uid, pageNumber, pageSize) {
  try {
    const paymentRecords = await fetchPaymentRecords(uid, pageNumber, pageSize);

    // Update the table with payment records
    updatePaymentTable(paymentRecords);

    // Get total number of records for calculating total pages
    const totalRecords = await getTotalPaymentRecords(uid); // Implement this to return the total number of payment records for the user
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Update pagination controls
    updatePaginationControls(totalPages, pageNumber);
  } catch (error) {
    console.error('Error handling pagination:', error);
    showErrorMessage('An error occurred while fetching payment records.');
  }
}

function updatePaymentTable(payments) {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = ''; // Clear existing table rows

  payments.forEach((payment, index) => {
    const row = `
      <tr class="align-middle">
        <td>${index + 1}.</td>
        <td>${payment.paymentId}</td>
        <td>${payment.reference}</td>
        <td>${payment.purpose}</td>
        <td><span class="badge text-bg-${payment.status === 'success' ? 'success' : 'danger'}">${payment.status}</span></td>
        <td>${new Date(payment.date).toLocaleString()}</td>
        <td>
          <div class="btn-group">
            <button
              type="button"
              class="btn btn-success btn-sm dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Action
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="${payment.purpose === 'Election' ? `http://localhost:3000/clients/election/candidate-registration/receipt.html?trxref=${payment.reference}` : '#'}">Print Receipt</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
    tbody.innerHTML += row; // Append new rows
  });
}

function updatePaginationControls(totalPages, currentPage) {
  const paginationControls = document.getElementById('paginationControls');
  paginationControls.innerHTML = ''; // Clear existing pagination buttons

  // Create previous button
  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevButton.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) handlePagination(uid, currentPage - 1, 10);
  });
  paginationControls.appendChild(prevButton);

  // Create page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('li');
    pageButton.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageButton.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageButton.addEventListener('click', () => handlePagination(uid, i, 10));
    paginationControls.appendChild(pageButton);
  }

  // Create next button
  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextButton.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) handlePagination(uid, currentPage + 1, 10);
  });
  paginationControls.appendChild(nextButton);
}
