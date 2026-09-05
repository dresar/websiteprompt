import { create } from 'zustand';

interface FormSubmission {
  id: number;
  formType: string;
  inputData: string;
  outputData: string;
  createdAt: string;
}

interface ChatMessage {
  id: number;
  sessionId: string;
  messageType: 'user' | 'assistant';
  content: string;
  metadata?: any;
  createdAt: string;
}

interface ChatSession {
  sessionId: string;
  firstMessage: string;
  lastMessage: string;
  messageCount: number;
}

interface AppState {
  // Form state
  currentFormType: string | null;
  formHistory: FormSubmission[];
  isProcessing: boolean;
  
  // Chat state
  currentSessionId: string | null;
  chatHistory: ChatMessage[];
  chatSessions: ChatSession[];
  
  // UI state
  activeTab: 'image' | 'video' | 'code';
  sidebarOpen: boolean;
  
  // Actions
  setCurrentFormType: (formType: string | null) => void;
  setFormHistory: (history: FormSubmission[]) => void;
  addFormSubmission: (submission: FormSubmission) => void;
  setProcessing: (processing: boolean) => void;
  
  setCurrentSessionId: (sessionId: string | null) => void;
  setChatHistory: (history: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatSessions: (sessions: ChatSession[]) => void;
  
  setActiveTab: (tab: 'image' | 'video' | 'code') => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Reset functions
  resetFormState: () => void;
  resetChatState: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentFormType: null,
  formHistory: [],
  isProcessing: false,
  
  currentSessionId: null,
  chatHistory: [],
  chatSessions: [],
  
  activeTab: 'image',
  sidebarOpen: false,
  
  // Form actions
  setCurrentFormType: (formType) => set({ currentFormType: formType }),
  
  setFormHistory: (history) => set({ formHistory: history }),
  
  addFormSubmission: (submission) => set((state) => ({
    formHistory: [submission, ...state.formHistory]
  })),
  
  setProcessing: (processing) => set({ isProcessing: processing }),
  
  // Chat actions
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
  
  setChatHistory: (history) => set({ chatHistory: history }),
  
  addChatMessage: (message) => set((state) => ({
    chatHistory: [...state.chatHistory, message]
  })),
  
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  
  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Reset functions
  resetFormState: () => set({
    currentFormType: null,
    formHistory: [],
    isProcessing: false
  }),
  
  resetChatState: () => set({
    currentSessionId: null,
    chatHistory: [],
    chatSessions: []
  }),
  
  resetAll: () => set({
    currentFormType: null,
    formHistory: [],
    isProcessing: false,
    currentSessionId: null,
    chatHistory: [],
    chatSessions: [],
    activeTab: 'image',
    sidebarOpen: false
  })
}));