// Function to vaildate Martic No
export async function validateMarticNo(data, csrfToken) {
  try {
    const response = await fetch('http://localhost:4000/api/validate-matric', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ data }),
    });

    return response;
  } catch (error) {
    throw new Error('Martic No validation failed: ' + error.message);
  }
}
