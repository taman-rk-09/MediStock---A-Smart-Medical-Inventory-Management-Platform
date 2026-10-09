import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/ai';

export const sendAiChatQuery = async (prompt) => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await axios.post(
      `${API_BASE_URL}/chat`,
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error connecting to AI backend:", error);
    throw error;
  }
};

export const fetchExecutiveInsights = async () => {
  try {
    const token = localStorage.getItem('userToken');
    const response = await axios.get(`${API_BASE_URL}/executive-insights`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI executive insights:", error);
    throw error;
  }
};