import { mockDb, userService, formService, chatService, User, FormSubmission, ChatMessage } from './mockDatabase';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'your-secret-key-change-in-production';

// Types for API responses
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

export interface FormSubmissionRequest {
  userId: number;
  formType: 'image' | 'video' | 'code';
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
}

export interface ChatMessageRequest {
  userId: number;
  sessionId: string;
  message: string;
  role: 'user' | 'assistant';
}

// Authentication API
export class AuthAPI {
  static async register(data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Check if user already exists
      const existingUser = db.getUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const userId = db.createUser({
        username: data.username,
        email: data.email,
        password: hashedPassword
      });

      const user = db.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: 'Failed to create user'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        data: { user, token },
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  static async login(data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Find user by email
      const user = db.getUserByEmail(data.email);
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        success: true,
        data: { user, token },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  static async verifyToken(token: string): Promise<ApiResponse<User>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      const user = db.getUserById(decoded.userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }
  }
}

// Form Submission API
export class FormAPI {
  static async submitForm(data: FormSubmissionRequest): Promise<ApiResponse<FormSubmission>> {
    try {
      const submissionId = db.createFormSubmission({
        userId: data.userId,
        formType: data.formType,
        inputData: JSON.stringify(data.inputData),
        outputData: data.outputData ? JSON.stringify(data.outputData) : null
      });

      const submission = db.getFormSubmissionById(submissionId);
      if (!submission) {
        return {
          success: false,
          error: 'Failed to create form submission'
        };
      }

      return {
        success: true,
        data: submission,
        message: 'Form submitted successfully'
      };
    } catch (error) {
      console.error('Form submission error:', error);
      return {
        success: false,
        error: 'Failed to submit form. Please try again.'
      };
    }
  }

  static async getUserSubmissions(userId: number, formType?: string): Promise<ApiResponse<FormSubmission[]>> {
    try {
      const submissions = db.getFormSubmissionsByUser(userId, formType);
      return {
        success: true,
        data: submissions
      };
    } catch (error) {
      console.error('Get submissions error:', error);
      return {
        success: false,
        error: 'Failed to retrieve submissions'
      };
    }
  }

  static async updateFormSubmission(
    submissionId: number, 
    outputData: Record<string, any>
  ): Promise<ApiResponse<FormSubmission>> {
    try {
      const updated = db.updateFormSubmission(submissionId, JSON.stringify(outputData));
      if (!updated) {
        return {
          success: false,
          error: 'Submission not found'
        };
      }

      const submission = db.getFormSubmissionById(submissionId);
      return {
        success: true,
        data: submission!,
        message: 'Submission updated successfully'
      };
    } catch (error) {
      console.error('Update submission error:', error);
      return {
        success: false,
        error: 'Failed to update submission'
      };
    }
  }
}

// Chat API
export class ChatAPI {
  static async saveMessage(data: ChatMessageRequest): Promise<ApiResponse<ChatMessage>> {
    try {
      const messageId = db.createChatMessage({
        userId: data.userId,
        sessionId: data.sessionId,
        message: data.message,
        role: data.role
      });

      const message = db.getChatMessageById(messageId);
      if (!message) {
        return {
          success: false,
          error: 'Failed to save message'
        };
      }

      return {
        success: true,
        data: message,
        message: 'Message saved successfully'
      };
    } catch (error) {
      console.error('Save message error:', error);
      return {
        success: false,
        error: 'Failed to save message'
      };
    }
  }

  static async getChatHistory(userId: number, sessionId?: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const messages = db.getChatMessagesByUser(userId, sessionId);
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      console.error('Get chat history error:', error);
      return {
        success: false,
        error: 'Failed to retrieve chat history'
      };
    }
  }

  static async getChatSessions(userId: number): Promise<ApiResponse<string[]>> {
    try {
      const sessions = db.getChatSessionsByUser(userId);
      return {
        success: true,
        data: sessions
      };
    } catch (error) {
      console.error('Get chat sessions error:', error);
      return {
        success: false,
        error: 'Failed to retrieve chat sessions'
      };
    }
  }

  static async deleteChatSession(userId: number, sessionId: string): Promise<ApiResponse<boolean>> {
    try {
      const deleted = db.deleteChatSession(userId, sessionId);
      return {
        success: true,
        data: deleted,
        message: deleted ? 'Session deleted successfully' : 'Session not found'
      };
    } catch (error) {
      console.error('Delete session error:', error);
      return {
        success: false,
        error: 'Failed to delete session'
      };
    }
  }
}

// Analytics API
export class AnalyticsAPI {
  static async getUserStats(userId: number): Promise<ApiResponse<{
    totalSubmissions: number;
    submissionsByType: Record<string, number>;
    totalChatMessages: number;
    activeSessions: number;
    recentActivity: Array<{
      type: 'form' | 'chat';
      timestamp: string;
      details: string;
    }>;
  }>> {
    try {
      const submissions = db.getFormSubmissionsByUser(userId);
      const messages = db.getChatMessagesByUser(userId);
      const sessions = db.getChatSessionsByUser(userId);

      const submissionsByType = submissions.reduce((acc, sub) => {
        acc[sub.formType] = (acc[sub.formType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentActivity = [
        ...submissions.slice(-5).map(sub => ({
          type: 'form' as const,
          timestamp: sub.createdAt,
          details: `${sub.formType} form submitted`
        })),
        ...messages.slice(-5).map(msg => ({
          type: 'chat' as const,
          timestamp: msg.createdAt,
          details: `${msg.role} message in session ${msg.sessionId.slice(0, 8)}...`
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      return {
        success: true,
        data: {
          totalSubmissions: submissions.length,
          submissionsByType,
          totalChatMessages: messages.length,
          activeSessions: sessions.length,
          recentActivity
        }
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        success: false,
        error: 'Failed to retrieve user statistics'
      };
    }
  }
}

// Error handling utility
export function handleApiError(error: any): ApiResponse {
  console.error('API Error:', error);
  
  if (error.code === 'SQLITE_CONSTRAINT') {
    return {
      success: false,
      error: 'Data constraint violation. Please check your input.'
    };
  }
  
  if (error.code === 'SQLITE_BUSY') {
    return {
      success: false,
      error: 'Database is busy. Please try again in a moment.'
    };
  }
  
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.'
  };
}