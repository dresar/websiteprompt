import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Repeat, 
  Trash2, 
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { chatService } from '@/lib/mockDatabase';

interface ChatMessage {
  id: number;
  user_id: number;
  session_id: string;
  message: string;
  response: string;
  created_at: string;
}

interface ChatHistoryProps {
  currentUser: any;
  onRepeatPrompt: (message: string, context?: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ currentUser, onRepeatPrompt }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, [currentUser]);

  const loadChatHistory = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Simulate loading chat history from different sessions
      const sessions = ['session-1', 'session-2', 'session-3'];
      let allMessages: ChatMessage[] = [];
      
      for (const sessionId of sessions) {
        const messages = await chatService.getChatHistory(currentUser.id, sessionId);
        allMessages = [...allMessages, ...messages];
      }
      
      // Sort by created_at descending
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setChatHistory(allMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = async (message: string, id: number) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number, sessionId: string) => {
    try {
      await chatService.deleteChatSession(currentUser.id, sessionId);
      setChatHistory(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Baru saja';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} jam yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full pb-20 px-4 md:px-0"> {/* Add horizontal padding for mobile */}
      <Card className="h-full border-0 md:border shadow-none md:shadow-sm">
        <CardHeader className="pb-3 px-4 md:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <MessageSquare className="h-5 w-5" />
            <span>History Chat</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {chatHistory.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum Ada History
                </h3>
                <p className="text-gray-500 text-sm md:text-base">
                  Mulai percakapan untuk melihat history chat Anda
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-3 md:p-4">
                {chatHistory.map((chat) => (
                  <Card key={chat.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-3 md:p-4">
                      {/* Message Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs md:text-sm text-gray-500">
                            {formatDate(chat.created_at)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {chat.session_id}
                        </Badge>
                      </div>
                      
                      {/* User Message */}
                      <div className="mb-3">
                        <div className="bg-blue-50 rounded-lg p-3 mb-2">
                          <p className="text-xs md:text-sm font-medium text-blue-900 mb-1">Prompt Anda:</p>
                          <p className="text-xs md:text-sm text-blue-800 line-clamp-3">
                            {chat.message}
                          </p>
                        </div>
                      </div>
                      
                      {/* Response */}
                      {chat.response && (
                        <div className="mb-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs md:text-sm font-medium text-gray-900 mb-1">Response:</p>
                            <p className="text-xs md:text-sm text-gray-700 line-clamp-3">
                              {chat.response}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons - Responsive layout */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pt-2 border-t border-gray-100 space-y-2 md:space-y-0">
                        <div className="flex space-x-2 flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRepeatPrompt(chat.message, chat.response)}
                            className="flex items-center space-x-1 flex-1 md:flex-none h-8 md:h-9"
                          >
                            <Repeat className="h-3 w-3" />
                            <span className="text-xs">Ulangi</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyMessage(chat.message, chat.id)}
                            className="flex items-center space-x-1 flex-1 md:flex-none h-8 md:h-9"
                          >
                            {copiedId === chat.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span className="text-xs">
                              {copiedId === chat.id ? 'Tersalin' : 'Salin'}
                            </span>
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(chat.id, chat.session_id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 md:h-9 w-full md:w-auto"
                        >
                          <Trash2 className="h-3 w-3 mr-1 md:mr-0" />
                          <span className="md:hidden text-xs">Hapus</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatHistory;