import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import AdminInfo from '@/components/AdminInfo';
import MobileNavigation from '@/components/MobileNavigation';
import ChatHistory from '@/components/ChatHistory';
import { jwtUtils } from '@/lib/jwtUtils';
import { authService } from '@/lib/mockDatabase';
import UserProfile from '@/components/UserProfile';
import PromptInput from '@/components/PromptInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MessageSquare, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import OptimizedFeaturesSection from '@/components/OptimizedFeaturesSection';

type ActiveView = 'home' | 'profile' | 'prompt' | 'history' | 'login' | 'register';

function App() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      const tokenData = jwtUtils.verifyToken(token);
      if (tokenData) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        setActiveView('home');
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleError = (error: Error, errorInfo: any) => {
    console.error('Application Error:', error, errorInfo);
    toast({
      title: "Terjadi Kesalahan",
      description: "Aplikasi mengalami error. Silakan refresh halaman.",
      variant: "destructive"
    });
  };

  const handleLoginSuccess = (userData: any) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setActiveView('home');
  };

  const handleRegisterSuccess = (userData: any) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setActiveView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveView('login');
  };

  const handleUpdateProfile = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentUser({ ...currentUser, ...data });
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...data }));
    console.log('Profile update:', data);
    toast({
      title: "Berhasil",
      description: "Profil berhasil diperbarui.",
    });
  };

  const handlePromptSubmit = async (prompt: string): Promise<string> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock response based on prompt length
    const responseLength = Math.min(prompt.length * 2, 1000);
    const mockResponse = `Ini adalah response simulasi untuk prompt Anda. 

Prompt yang Anda masukkan memiliki ${prompt.length} karakter dan ${prompt.split(' ').length} kata.

Response ini dibuat secara otomatis untuk demonstrasi fitur input prompt yang dapat menangani teks panjang dengan baik. Dalam implementasi nyata, di sini akan ada hasil pemrosesan AI yang sesungguhnya.

Fitur-fitur yang tersedia:
- Input teks panjang hingga 10,000 karakter
- Auto-save draft
- Riwayat prompt
- Copy dan download response
- Indikator performa pemrosesan

Terima kasih telah menggunakan sistem ini!`;

    return mockResponse;
  };

  const handleRepeatPrompt = (message: string, context?: string) => {
    setActiveView('prompt');
    // You can pass the message and context to PromptInput component
    // This would require updating PromptInput to accept initial values
  };

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <UserProfile user={currentUser} onUpdateUser={setCurrentUser} />;
      case 'prompt':
        return <PromptInput user={currentUser} />;
      case 'history':
        return <ChatHistory currentUser={currentUser} onRepeatPrompt={handleRepeatPrompt} />;
      default:
        return (
          <div className="space-y-8 pb-20"> {/* Add padding for mobile navigation */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Prompt Master
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Platform AI terdepan untuk mengoptimalkan prompt dan meningkatkan produktivitas Anda
              </p>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-center space-x-4 mt-6">
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isAuthenticated ? 'Authenticated' : 'Guest'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200" 
                    onClick={() => setActiveView('profile')}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Profil Pengguna</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Kelola informasi akun dan preferensi Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700">
                    Lihat Profil
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200" 
                    onClick={() => setActiveView('prompt')}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Input Prompt</CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Masukkan prompt Anda dan dapatkan hasil optimal
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700">
                    Mulai Prompt
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <OptimizedFeaturesSection />
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            {activeView === 'register' ? (
              <>
                <RegisterForm onSuccess={handleLoginSuccess} />
                <div className="text-center">
                  <button
                    onClick={() => setActiveView('login')}
                    className="text-blue-600 hover:text-blue-800 text-base font-medium"
                  >
                    Sudah punya akun? Login di sini
                  </button>
                </div>
              </>
            ) : (
              <>
                <LoginForm onSuccess={handleLoginSuccess} />
                <AdminInfo />
                <div className="text-center">
                  <button
                    onClick={() => setActiveView('register')}
                    className="text-blue-600 hover:text-blue-800 text-base font-medium"
                  >
                    Belum punya akun? Daftar di sini
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <Toaster />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:block bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Prompt Master</h1>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={activeView === 'home' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('home')}
                >
                  Home
                </Button>
                <Button
                  variant={activeView === 'profile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
                <Button
                  variant={activeView === 'prompt' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('prompt')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Prompt
                </Button>
                <Button
                  variant={activeView === 'history' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('history')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="py-8">
          {renderContent()}
        </main>

        {/* Mobile Navigation - Only visible on mobile */}
        <div className="md:hidden">
          <MobileNavigation
            activeView={activeView}
            onViewChange={setActiveView}
            onLogout={handleLogout}
            isOnline={isOnline}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
          />
        </div>
        
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;
