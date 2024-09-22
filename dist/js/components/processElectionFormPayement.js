// Function to process elction payments
export async function processElectionPayment(email, pka, role, uid, csrfToken) {
    try {
      const response = await fetch('http://localhost:4000/election-payment-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken, // Ensure csrfToken is defined
        },
        credentials: 'include',
        body: JSON.stringify({ email, pka, role, uid }),
      });

      return response;
    } catch (error) {
      throw new Error('Failed to process payments');
    }
  }
