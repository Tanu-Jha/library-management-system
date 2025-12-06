const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};

// Books API
export const booksApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/books?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAvailable: async () => {
    const response = await fetch(`${API_URL}/api/books?status=Available`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  searchNames: async (query = '') => {
    const response = await fetch(`${API_URL}/api/books/search/names?q=${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  searchAuthors: async (query = '') => {
    const response = await fetch(`${API_URL}/api/books/search/authors?q=${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (bookData) => {
    const response = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookData)
    });
    return handleResponse(response);
  },

  update: async (id, bookData) => {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Movies API
export const moviesApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/movies?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/movies/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getAvailable: async () => {
    const response = await fetch(`${API_URL}/api/movies?status=Available`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (movieData) => {
    const response = await fetch(`${API_URL}/api/movies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData)
    });
    return handleResponse(response);
  },

  update: async (id, movieData) => {
    const response = await fetch(`${API_URL}/api/movies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Members API
export const membersApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/members?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/members/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (memberData) => {
    const response = await fetch(`${API_URL}/api/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    return handleResponse(response);
  },

  update: async (id, memberData) => {
    const response = await fetch(`${API_URL}/api/members/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Transactions API
export const transactionsApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/transactions?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getActive: async () => {
    const response = await fetch(`${API_URL}/api/transactions/active`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getOverdue: async () => {
    const response = await fetch(`${API_URL}/api/transactions/overdue`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  issue: async (data) => {
    const response = await fetch(`${API_URL}/api/transactions/issue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  return: async (data) => {
    const response = await fetch(`${API_URL}/api/transactions/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  payFine: async (data) => {
    const response = await fetch(`${API_URL}/api/transactions/pay-fine`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  calculateFine: async (transactionId, returnDate) => {
    const params = returnDate ? `?returnDate=${returnDate}` : '';
    const response = await fetch(`${API_URL}/api/transactions/fine/${transactionId}${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Issue Requests API
export const issueRequestsApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/issue-requests?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getPending: async () => {
    const response = await fetch(`${API_URL}/api/issue-requests/pending`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/api/issue-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/api/issue-requests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

// Users API
export const usersApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (userData) => {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  update: async (id, userData) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};