import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Video, 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  User, 
  LogOut,
  Save,
  History,
  Settings,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { AuthModal } from './auth/AuthModal';
import { formService, chatService } from '@/lib/mockDatabase';
import { FormAPI, ChatAPI, AnalyticsAPI } from '@/lib/api';
import { useFormValidation } from '@/hooks/useFormValidation';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

// Form validation schemas
const imageFormSchema = yup.object({
  prompt: yup.string().required('Prompt wajib diisi').min(5, 'Prompt minimal 5 karakter'),
  style: yup.string().required('Style wajib dipilih'),
  quality: yup.string().required('Quality wajib dipilih'),
  resolution: yup.string().required('Resolution wajib dipilih'),
  lighting: yup.string().required('Lighting wajib dipilih'),
  mood: yup.string().required('Mood wajib dipilih')
});

const videoFormSchema = yup.object({
  prompt: yup.string().required('Prompt wajib diisi').min(5, 'Prompt minimal 5 karakter'),
  duration: yup.string().required('Duration wajib dipilih'),
  cameraMovement: yup.string().required('Camera movement wajib dipilih'),
  transition: yup.string().required('Transition wajib dipilih'),
  quality: yup.string().required('Quality wajib dipilih'),
  frameRate: yup.string().required('Frame rate wajib dipilih')
});

const codeFormSchema = yup.object({
  prompt: yup.string().required('Prompt wajib diisi').min(10, 'Prompt minimal 10 karakter'),
  language: yup.string().required('Bahasa pemrograman wajib dipilih'),
  framework: yup.string().required('Framework wajib dipilih'),
  complexity: yup.string().required('Complexity wajib dipilih'),
  features: yup.array().min(1, 'Minimal pilih 1 fitur')
});

type ImageFormData = yup.InferType<typeof imageFormSchema>;
type VideoFormData = yup.InferType<typeof videoFormSchema>;
type CodeFormData = yup.InferType<typeof codeFormSchema>;

const OptimizedFeaturesSection = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { user, logout } = useAuthStore();
  const { 
    currentFormType, 
    setCurrentFormType, 
    formHistory,
    addFormSubmission,
    addChatMessage,
    currentSessionId
  } = useAppStore();

  // Performance optimization hooks
  const { createDebouncedCallback, memoizedCompute } = usePerformanceOptimization();
  
  // Form validation hooks
  const imageValidation = useFormValidation(imageFormSchema);
  const videoValidation = useFormValidation(videoFormSchema);
  const codeValidation = useFormValidation(codeFormSchema);

  // Additional state management
  const [userStats, setUserStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Form configurations
  const imageForm = useForm<ImageFormData>({
    resolver: yupResolver(imageFormSchema),
    mode: 'onChange'
  });

  const videoForm = useForm<VideoFormData>({
    resolver: yupResolver(videoFormSchema),
    mode: 'onChange'
  });

  const codeForm = useForm<CodeFormData>({
    resolver: yupResolver(codeFormSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    setCurrentFormType(activeTab as 'image' | 'video' | 'code');
  }, [activeTab, setCurrentFormType]);

  // Load user statistics
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      const response = await AnalyticsAPI.getUserStats(user.id);
      if (response.success) {
        setUserStats(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Optimized form submission handler
  const handleFormSubmission = useCallback(async (
    formType: 'image' | 'video' | 'code',
    inputData: any,
    outputData?: any
  ) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await FormAPI.submitForm({
        userId: user.id,
        formType,
        inputData,
        outputData
      });

      if (response.success) {
        addFormSubmission({
          id: response.data!.id,
          formType: formType,
          inputData: JSON.stringify(inputData),
          outputData: JSON.stringify(outputData || {}),
          createdAt: new Date().toISOString()
        });

        toast({
          title: "Success",
          description: "Form submitted successfully",
        });

        // Refresh stats
        loadUserStats();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    }
  }, [user, addFormSubmission, toast]);

  // Debounced optimization function
  const debouncedOptimize = createDebouncedCallback(async (
    formType: 'image' | 'video' | 'code',
    inputData: any
  ) => {
    setIsOptimizing(true);
    
    try {
      // Simulate API call for prompt optimization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const optimizedPrompt = memoizedCompute(
        `optimize_${formType}`,
        () => {
          switch (formType) {
            case 'image':
              return optimizeImagePrompt(inputData);
            case 'video':
              return optimizeVideoPrompt(inputData);
            case 'code':
              return optimizeCodePrompt(inputData);
            default:
              return inputData.prompt;
          }
        },
        [formType, inputData]
      );

      // Save to database
      await handleFormSubmission(formType, inputData, { optimizedPrompt });
      
      return optimizedPrompt;
    } finally {
      setIsOptimizing(false);
    }
  }, 500);

  // Optimization functions
  const optimizeImagePrompt = (data: ImageFormData): string => {
    const { prompt, style, quality, resolution, lighting, mood } = data;
    return `${prompt}, ${style} style, ${quality} quality, ${resolution} resolution, ${lighting} lighting, ${mood} mood, highly detailed, professional photography, studio lighting, sharp focus, cinematic composition, vibrant colors, masterpiece quality, trending on artstation, photorealistic rendering, perfect anatomy, dramatic lighting, depth of field, ultra-wide angle, hyper-realistic textures, award-winning photography`;
  };

  const optimizeVideoPrompt = (data: VideoFormData): string => {
    const { prompt, duration, cameraMovement, transition, quality, frameRate } = data;
    return `${prompt}, ${duration} duration, ${cameraMovement} camera movement, ${transition} transitions, ${quality} quality, ${frameRate} fps, cinematic sequence, smooth camera movement, professional videography, dynamic transitions, establishing shot to close-up, balanced composition, color grading, dramatic lighting transitions, seamless cuts, depth of field changes, cinematic color palette, professional audio sync, Hollywood-style production value, trending on film festivals`;
  };

  const optimizeCodePrompt = (data: CodeFormData): string => {
    const { prompt, language, framework, complexity, features } = data;
    const featuresText = Array.isArray(features) ? features.join(', ') : '';
    
    return `Buatkan ${prompt} menggunakan ${language} dengan ${framework}. 
    
Tingkat kompleksitas: ${complexity}
Fitur yang dibutuhkan: ${featuresText}

Spesifikasi teknis:
1. Bahasa: ${language} (versi terbaru yang stabil)
2. Framework: ${framework}
3. Arsitektur: Clean Architecture dengan separation of concerns
4. Error handling: Implementasi try-catch yang comprehensive
5. Validasi input: Validasi semua input user dengan real-time feedback
6. Testing: Unit test untuk semua fungsi utama
7. Documentation: Komentar lengkap dalam bahasa Indonesia
8. Type hints: Gunakan untuk semua fungsi dan parameter
9. Security: Implementasi security measures dan input sanitization
10. Performance: Optimasi kode untuk performa terbaik

Struktur yang diharapkan:
- Modular code structure dengan separation of concerns
- Consistent naming conventions
- Proper error handling dan user feedback
- Responsive design (jika aplikasi web)
- Database integration (jika diperlukan)
- API documentation (jika ada endpoint)

Berikan kode lengkap yang siap dijalankan dengan dokumentasi comprehensive.`;
  };

  const handleOptimize = async (formType: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsOptimizing(true);
    
    try {
      let optimizedPrompt = '';
      let formData: any = {};

      switch (formType) {
        case 'image':
          const imageData = imageForm.getValues();
          const imageValid = await imageForm.trigger();
          if (!imageValid) return;
          
          formData = imageData;
          optimizedPrompt = optimizeImagePrompt(imageData);
          break;
          
        case 'video':
          const videoData = videoForm.getValues();
          const videoValid = await videoForm.trigger();
          if (!videoValid) return;
          
          formData = videoData;
          optimizedPrompt = optimizeVideoPrompt(videoData);
          break;
          
        case 'code':
          const codeData = codeForm.getValues();
          const codeValid = await codeForm.trigger();
          if (!codeValid) return;
          
          formData = codeData;
          optimizedPrompt = optimizeCodePrompt(codeData);
          break;
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setOptimizedResult(optimizedPrompt);

      // Save to database
      if (user) {
        await formService.saveFormSubmission(
          user.id,
          formType as 'image' | 'video' | 'code',
          formData,
          optimizedPrompt
        );

        // Add to chat history
        const sessionId = currentSessionId || `session-${Date.now()}`;
        addChatMessage({
          id: Date.now(),
          sessionId: sessionId,
          messageType: 'user',
          content: formData.prompt,
          createdAt: new Date().toISOString()
        });

        addChatMessage({
          id: Date.now() + 1,
          sessionId: sessionId,
          messageType: 'assistant',
          content: optimizedPrompt,
          createdAt: new Date().toISOString()
        });

        // Add to submission history
        addFormSubmission({
          id: Date.now(),
          formType: formType as string,
          inputData: JSON.stringify(formData),
          outputData: JSON.stringify({ optimizedPrompt }),
          createdAt: new Date().toISOString()
        });
      }

      toast({
        title: "Prompt berhasil dioptimalkan!",
        description: "Prompt Anda telah ditingkatkan dengan detail yang lebih baik.",
      });

    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal mengoptimalkan prompt. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = async () => {
    if (!optimizedResult) return;
    
    try {
      await navigator.clipboard.writeText(optimizedResult);
      setCopied(true);
      toast({
        title: "Berhasil disalin!",
        description: "Prompt yang dioptimalkan telah disalin ke clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Gagal menyalin",
        description: "Terjadi error saat menyalin ke clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setOptimizedResult('');
    toast({
      title: "Berhasil logout",
      description: "Anda telah keluar dari sistem.",
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Pengoptimal Prompt AI
            </h1>
            <p className="text-muted-foreground">
              Tingkatkan kualitas prompt Anda dengan form terstruktur
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="px-3 py-1">
                  <User className="w-4 h-4 mr-1" />
                  {user.username}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)}>
                <User className="w-4 h-4 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Konfigurasi Prompt</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="image" className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>Gambar</span>
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4" />
                      <span>Kode</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Image Form */}
                  <TabsContent value="image" className="space-y-4">
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="image-prompt">Prompt Dasar *</Label>
                        <Textarea
                          id="image-prompt"
                          placeholder="Deskripsikan gambar yang ingin Anda buat..."
                          className="min-h-[100px]"
                          {...imageForm.register('prompt')}
                        />
                        {imageForm.formState.errors.prompt && (
                          <p className="text-sm text-destructive mt-1">
                            {imageForm.formState.errors.prompt.message}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Style *</Label>
                          <Controller
                            name="style"
                            control={imageForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih style" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="realistic">Realistic</SelectItem>
                                  <SelectItem value="artistic">Artistic</SelectItem>
                                  <SelectItem value="cartoon">Cartoon</SelectItem>
                                  <SelectItem value="abstract">Abstract</SelectItem>
                                  <SelectItem value="vintage">Vintage</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {imageForm.formState.errors.style && (
                            <p className="text-sm text-destructive mt-1">
                              {imageForm.formState.errors.style.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Quality *</Label>
                          <Controller
                            name="quality"
                            control={imageForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih quality" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="ultra">Ultra</SelectItem>
                                  <SelectItem value="masterpiece">Masterpiece</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Resolution *</Label>
                          <Controller
                            name="resolution"
                            control={imageForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih resolution" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                                  <SelectItem value="1920x1080">1920x1080 (HD)</SelectItem>
                                  <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
                                  <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                                  <SelectItem value="7680x4320">7680x4320 (8K)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Lighting *</Label>
                          <Controller
                            name="lighting"
                            control={imageForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih lighting" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="natural">Natural</SelectItem>
                                  <SelectItem value="studio">Studio</SelectItem>
                                  <SelectItem value="dramatic">Dramatic</SelectItem>
                                  <SelectItem value="soft">Soft</SelectItem>
                                  <SelectItem value="golden-hour">Golden Hour</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Mood *</Label>
                          <Controller
                            name="mood"
                            control={imageForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih mood" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cheerful">Cheerful</SelectItem>
                                  <SelectItem value="mysterious">Mysterious</SelectItem>
                                  <SelectItem value="romantic">Romantic</SelectItem>
                                  <SelectItem value="energetic">Energetic</SelectItem>
                                  <SelectItem value="peaceful">Peaceful</SelectItem>
                                  <SelectItem value="dramatic">Dramatic</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleOptimize('image')}
                        disabled={isOptimizing || !imageForm.formState.isValid}
                        className="w-full"
                      >
                        {isOptimizing ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Mengoptimalkan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Optimalkan Prompt Gambar
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Video Form */}
                  <TabsContent value="video" className="space-y-4">
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="video-prompt">Prompt Dasar *</Label>
                        <Textarea
                          id="video-prompt"
                          placeholder="Deskripsikan video yang ingin Anda buat..."
                          className="min-h-[100px]"
                          {...videoForm.register('prompt')}
                        />
                        {videoForm.formState.errors.prompt && (
                          <p className="text-sm text-destructive mt-1">
                            {videoForm.formState.errors.prompt.message}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Duration *</Label>
                          <Controller
                            name="duration"
                            control={videoForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih durasi" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="short">Short (5-15s)</SelectItem>
                                  <SelectItem value="medium">Medium (30-60s)</SelectItem>
                                  <SelectItem value="long">Long (2-5min)</SelectItem>
                                  <SelectItem value="extended">Extended (5min+)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Camera Movement *</Label>
                          <Controller
                            name="cameraMovement"
                            control={videoForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih gerakan kamera" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="static">Static</SelectItem>
                                  <SelectItem value="pan">Pan</SelectItem>
                                  <SelectItem value="tilt">Tilt</SelectItem>
                                  <SelectItem value="zoom">Zoom</SelectItem>
                                  <SelectItem value="tracking">Tracking</SelectItem>
                                  <SelectItem value="handheld">Handheld</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Transition *</Label>
                          <Controller
                            name="transition"
                            control={videoForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih transisi" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cut">Cut</SelectItem>
                                  <SelectItem value="fade">Fade</SelectItem>
                                  <SelectItem value="dissolve">Dissolve</SelectItem>
                                  <SelectItem value="wipe">Wipe</SelectItem>
                                  <SelectItem value="slide">Slide</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Quality *</Label>
                          <Controller
                            name="quality"
                            control={videoForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih quality" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="720p">720p HD</SelectItem>
                                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                                  <SelectItem value="1440p">1440p 2K</SelectItem>
                                  <SelectItem value="2160p">2160p 4K</SelectItem>
                                  <SelectItem value="4320p">4320p 8K</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Frame Rate *</Label>
                          <Controller
                            name="frameRate"
                            control={videoForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih frame rate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="24fps">24fps (Cinematic)</SelectItem>
                                  <SelectItem value="30fps">30fps (Standard)</SelectItem>
                                  <SelectItem value="60fps">60fps (Smooth)</SelectItem>
                                  <SelectItem value="120fps">120fps (Slow Motion)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleOptimize('video')}
                        disabled={isOptimizing || !videoForm.formState.isValid}
                        className="w-full"
                      >
                        {isOptimizing ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Mengoptimalkan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Optimalkan Prompt Video
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Code Form */}
                  <TabsContent value="code" className="space-y-4">
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="code-prompt">Deskripsi Aplikasi *</Label>
                        <Textarea
                          id="code-prompt"
                          placeholder="Deskripsikan aplikasi atau kode yang ingin Anda buat..."
                          className="min-h-[100px]"
                          {...codeForm.register('prompt')}
                        />
                        {codeForm.formState.errors.prompt && (
                          <p className="text-sm text-destructive mt-1">
                            {codeForm.formState.errors.prompt.message}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Bahasa Pemrograman *</Label>
                          <Controller
                            name="language"
                            control={codeForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih bahasa" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="javascript">JavaScript</SelectItem>
                                  <SelectItem value="typescript">TypeScript</SelectItem>
                                  <SelectItem value="python">Python</SelectItem>
                                  <SelectItem value="java">Java</SelectItem>
                                  <SelectItem value="csharp">C#</SelectItem>
                                  <SelectItem value="php">PHP</SelectItem>
                                  <SelectItem value="go">Go</SelectItem>
                                  <SelectItem value="rust">Rust</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div>
                          <Label>Framework *</Label>
                          <Controller
                            name="framework"
                            control={codeForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih framework" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="react">React</SelectItem>
                                  <SelectItem value="vue">Vue.js</SelectItem>
                                  <SelectItem value="angular">Angular</SelectItem>
                                  <SelectItem value="nextjs">Next.js</SelectItem>
                                  <SelectItem value="django">Django</SelectItem>
                                  <SelectItem value="flask">Flask</SelectItem>
                                  <SelectItem value="express">Express.js</SelectItem>
                                  <SelectItem value="spring">Spring Boot</SelectItem>
                                  <SelectItem value="laravel">Laravel</SelectItem>
                                  <SelectItem value="none">Tanpa Framework</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Tingkat Kompleksitas *</Label>
                          <Controller
                            name="complexity"
                            control={codeForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kompleksitas" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner (Sederhana)</SelectItem>
                                  <SelectItem value="intermediate">Intermediate (Menengah)</SelectItem>
                                  <SelectItem value="advanced">Advanced (Lanjutan)</SelectItem>
                                  <SelectItem value="expert">Expert (Ahli)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Fitur Tambahan *</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            'Authentication',
                            'Database Integration',
                            'API Integration',
                            'Real-time Updates',
                            'File Upload',
                            'Email Notifications',
                            'Payment Gateway',
                            'Admin Dashboard',
                            'Mobile Responsive',
                            'PWA Support',
                            'Testing Suite',
                            'Docker Support'
                          ].map((feature) => (
                            <label key={feature} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={feature}
                                {...codeForm.register('features')}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{feature}</span>
                            </label>
                          ))}
                        </div>
                        {codeForm.formState.errors.features && (
                          <p className="text-sm text-destructive mt-1">
                            {codeForm.formState.errors.features.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleOptimize('code')}
                        disabled={isOptimizing || !codeForm.formState.isValid}
                        className="w-full"
                      >
                        {isOptimizing ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Mengoptimalkan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Optimalkan Prompt Kode
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Result Card */}
            {optimizedResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Hasil Optimasi</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={optimizedResult}
                    readOnly
                    className="min-h-[200px] text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* History Card */}
            {user && formHistory && formHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5" />
                    <span>Riwayat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {formHistory.slice(0, 5).map((item) => {
                      try {
                        const inputData = JSON.parse(item.inputData);
                        const outputData = JSON.parse(item.outputData);
                        return (
                          <div key={item.id} className="p-3 bg-secondary/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.formType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {inputData.prompt || 'No prompt'}
                            </p>
                          </div>
                        );
                      } catch (e) {
                        return null;
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tips Penggunaan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Isi semua field yang wajib untuk hasil optimal</p>
                <p>• Gunakan deskripsi yang spesifik dan detail</p>
                <p>• Login untuk menyimpan riwayat optimasi</p>
                <p>• Salin hasil untuk digunakan di AI tools</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </section>
  );
};

export default OptimizedFeaturesSection;