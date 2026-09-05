import bcrypt from 'bcryptjs';

const JWT_SECRET = 'your-secret-key-change-in-production';

// Mock database using localStorage
interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface FormSubmission {
  id: number;
  user_id: number;
  form_type: string;
  input_data: string;
  output_data: string;
  created_at: string;
}

interface ChatMessage {
  id: number;
  user_id: number;
  session_id: string;
  message: string;
  response: string;
  created_at: string;
}

class MockDatabase {
  private getUsers(): User[] {
    const users = localStorage.getItem('users');
    const parsedUsers = users ? JSON.parse(users) : [];
    
    // Inisialisasi dengan default admin user jika belum ada
    if (parsedUsers.length === 0) {
      this.initializeDefaultAdmin();
      return this.getUsers(); // Recursive call setelah inisialisasi
    }
    
    return parsedUsers;
  }

  private initializeDefaultAdmin(): void {
    const defaultAdmin: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify([defaultAdmin]));
  }

  private setUsers(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  private getFormSubmissions(): FormSubmission[] {
    const submissions = localStorage.getItem('form_submissions');
    return submissions ? JSON.parse(submissions) : [];
  }

  private setFormSubmissions(submissions: FormSubmission[]): void {
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
  }

  private getChatMessages(): ChatMessage[] {
    const messages = localStorage.getItem('chat_messages');
    return messages ? JSON.parse(messages) : [];
  }

  private setChatMessages(messages: ChatMessage[]): void {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }
}

const mockDb = new MockDatabase();

// Simple JWT implementation for browser
const simpleJWT = {
  encode: (payload: any): string => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },
  
  decode: (token: string): any => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      const expectedSignature = btoa(`${parts[0]}.${parts[1]}.${JWT_SECRET}`);
      
      if (parts[2] !== expectedSignature) return null;
      
      // Check expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) return null;
      
      return payload;
    } catch {
      return null;
    }
  }
};

// User service
export const userService = {
  async createUser(username: string, email: string, password: string): Promise<User> {
    const users = mockDb['getUsers']();
    
    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: mockDb['generateId'](),
      username,
      email,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(newUser);
    mockDb['setUsers'](users);
    return newUser;
  },

  async authenticateUser(username: string, password: string): Promise<User | null> {
    // Validasi input
    if (!username || !password) {
      console.error('Username atau password tidak boleh kosong');
      return null;
    }
    
    const users = mockDb['getUsers']();
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) {
      console.error('User tidak ditemukan:', username);
      return null;
    }
    
    if (!user.password_hash) {
      console.error('Password hash tidak ditemukan untuk user:', username);
      return null;
    }
    
    try {
      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error saat memverifikasi password:', error);
      return null;
    }
  },

  async getUserById(id: number): Promise<User | null> {
    const users = mockDb['getUsers']();
    return users.find(u => u.id === id) || null;
  },

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const users = mockDb['getUsers']();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates, updated_at: new Date().toISOString() };
    mockDb['setUsers'](users);
    return users[userIndex];
  },

  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.updateUser(id, { password_hash: hashedPassword });
    return result !== null;
  }
};

// Form service
export const formService = {
  async saveFormSubmission(userId: number, formType: string, inputData: string, outputData: string): Promise<FormSubmission> {
    const submissions = mockDb['getFormSubmissions']();
    const newSubmission: FormSubmission = {
      id: mockDb['generateId'](),
      user_id: userId,
      form_type: formType,
      input_data: inputData,
      output_data: outputData,
      created_at: new Date().toISOString()
    };

    submissions.push(newSubmission);
    mockDb['setFormSubmissions'](submissions);
    return newSubmission;
  },

  async getUserSubmissions(userId: number): Promise<FormSubmission[]> {
    const submissions = mockDb['getFormSubmissions']();
    return submissions.filter(s => s.user_id === userId);
  }
};

// Chat service
export const chatService = {
  async saveChatMessage(userId: number, sessionId: string, message: string, response: string): Promise<ChatMessage> {
    const messages = mockDb['getChatMessages']();
    const newMessage: ChatMessage = {
      id: mockDb['generateId'](),
      user_id: userId,
      session_id: sessionId,
      message,
      response,
      created_at: new Date().toISOString()
    };

    messages.push(newMessage);
    mockDb['setChatMessages'](messages);
    return newMessage;
  },

  async getChatHistory(userId: number, sessionId: string): Promise<ChatMessage[]> {
    const messages = mockDb['getChatMessages']();
    return messages.filter(m => m.user_id === userId && m.session_id === sessionId);
  },

  async deleteChatSession(userId: number, sessionId: string): Promise<boolean> {
    const messages = mockDb['getChatMessages']();
    const filteredMessages = messages.filter(m => !(m.user_id === userId && m.session_id === sessionId));
    mockDb['setChatMessages'](filteredMessages);
    return true;
  }
};

// JWT utilities
export const jwtUtils = {
  generateToken(userId: number): string {
    const payload = {
      userId,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    return simpleJWT.encode(payload);
  },

  verifyToken(token: string): { userId: number } | null {
    const decoded = simpleJWT.decode(token);
    return decoded && decoded.userId ? { userId: decoded.userId } : null;
  }
};

export { User, FormSubmission, ChatMessage };
export default mockDb;