// Function to select Candidate
export async function selectedCandidate(data, csrfToken) {
  try {
    const response = await fetch('http://localhost:4000/select-candidate', {
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
