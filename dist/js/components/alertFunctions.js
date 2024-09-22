// Display the error Msg
const errorMessageContainer = document.querySelector('.error-message-container')

// Function to display success message
export function showSuccessMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success alert-dismissible fade show';
  alertDiv.role = 'alert';

  alertDiv.innerHTML = `
    <strong>Success:</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  errorMessageContainer.innerHTML = '';
  errorMessageContainer.appendChild(alertDiv);
}

// Function to display error message
export function showErrorMessage(message) {
  // Create the Bootstrap alert element
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger alert-dismissible fade show';
  alertDiv.role = 'alert';

  // Insert the error message into the alert
  alertDiv.innerHTML = `
    <strong>Error:</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Clear any previous error messages abd Append the new alert to the container
  errorMessageContainer.innerHTML = '';
  errorMessageContainer.appendChild(alertDiv);
}