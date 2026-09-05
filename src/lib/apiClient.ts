// API Client untuk berkomunikasi dengan backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Helper function untuk fetch dengan error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Terjadi kesalahan',
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Tidak dapat terhubung ke server',
    };
  }
}

// Authentication API
export class AuthAPI {
  static async register(data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return fetchAPI<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async login(data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return fetchAPI<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async verifyToken(token: string): Promise<ApiResponse<User>> {
    return fetchAPI<User>('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

// Form API
export class FormAPI {
  static async submitForm(
    userId: number,
    formType: string,
    inputData: Record<string, any>,
    outputData?: Record<string, any>
  ): Promise<ApiResponse<{ id: number }>> {
    return fetchAPI<{ id: number }>('/forms', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        formType,
        inputData,
        outputData,
      }),
    });
  }

  static async getUserSubmissions(userId: number, limit?: number): Promise<ApiResponse<any[]>> {
    const query = limit ? `?limit=${limit}` : '';
    return fetchAPI<any[]>(`/forms/${userId}${query}`);
  }
}

// Chat API
export class ChatAPI {
  static async saveMessage(
    userId: number,
    sessionId: string,
    messageType: 'user' | 'assistant',
    content: string,
    metadata?: any
  ): Promise<ApiResponse<{ id: number }>> {
    return fetchAPI<{ id: number }>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        sessionId,
        messageType,
        content,
        metadata,
      }),
    });
  }

  static async getChatHistory(
    userId: number,
    sessionId?: string,
    limit?: number
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return fetchAPI<any[]>(`/chat/${userId}${query}`);
  }

  static async getChatSessions(userId: number): Promise<ApiResponse<any[]>> {
    return fetchAPI<any[]>(`/chat/sessions/${userId}`);
  }
}

