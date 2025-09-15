import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stack API
export const stackApi = {
  // Get all stacks
  getStacks: () => api.get('/stacks/'),
  
  // Get stack by ID
  getStack: (id: number) => api.get(`/stacks/${id}`),
  
  // Create new stack
  createStack: (data: { name: string; description?: string }) => 
    api.post('/stacks/', data),
  
  // Update stack
  updateStack: (id: number, data: { name?: string; description?: string; workflow_config?: any }) =>
    api.put(`/stacks/${id}`, data),
  
  // Delete stack
  deleteStack: (id: number) => api.delete(`/stacks/${id}`),
};

// Document API
export const documentApi = {
  // Upload document
  uploadDocument: (file: File, stackId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (stackId) {
      formData.append('stack_id', stackId.toString());
    }
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get documents
  getDocuments: (stackId?: number) => 
    api.get('/documents/', { params: { stack_id: stackId } }),
};

// Workflow API
export const workflowApi = {
  // Validate workflow
  validateWorkflow: (workflowConfig: any) =>
    api.post('/workflows/validate', workflowConfig),
  
  // Execute workflow
  executeWorkflow: (stackId: number, query: string) =>
    api.post('/workflows/execute', { stack_id: stackId, query }),
};

// Chat API
export const chatApi = {
  // Get chat history
  getChatHistory: (stackId: number) =>
    api.get(`/stacks/${stackId}/chat-history`),

  executeWorkflow: (stackId: number, input: string) =>
    axios.post(`${API_BASE_URL}/chat/${stackId}/execute`, { input }),
};

export default api;
