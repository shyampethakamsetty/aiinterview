const API_URL = 'http://localhost:8000';

export const submitAnswers = async (answers) => {
  try {
    const response = await fetch(`${API_URL}/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting answers:', error);
    throw error;
  }
}; 