
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/ai';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error(
      'Authentication token not found. Please log in again.'
    );
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

const getErrorMessage = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401 || status === 403) {
      return 'Your session may have expired or you do not have permission to access this AI feature. Please log in again.';
    }

    if (status === 503) {
      return typeof data?.response === 'string'
        ? data.response
        : typeof data?.executiveSummary === 'string'
          ? data.executiveSummary
          : 'The AI service is currently unavailable. Check that Ollama is running.';
    }

    if (status === 400) {
      return typeof data?.message === 'string'
        ? data.message
        : 'The request was invalid. Please check your input.';
    }

    return `AI request failed with HTTP ${status}. Please try again.`;
  }

  if (error.request) {
    return 'Cannot reach the MediStock backend. Make sure Spring Boot is running on port 8080.';
  }

  return error.message || 'An unexpected AI error occurred.';
};

// Send a message to the AI chatbot.
export const sendAiChatQuery = async (prompt) => {
  if (!prompt || !prompt.trim()) {
    throw new Error('Please enter a question before sending.');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat`,
      { prompt: prompt.trim() },
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Fetch AI executive insights.
export const fetchExecutiveInsights = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/executive-insights`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
