import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Copy, 
  Download, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  FileText,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface PromptInputProps {
  onSubmit?: (prompt: string) => Promise<string>;
  placeholder?: string;
  maxLength?: number;
  showWordCount?: boolean;
  enableAutoSave?: boolean;
  className?: string;
}

interface PromptHistory {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
  processingTime: number;
}

export function PromptInput({
  onSubmit,
  placeholder = "Masukkan prompt Anda di sini...",
  maxLength = 10000,
  showWordCount = true,
  enableAutoSave = true,
  className = ""
}: PromptInputProps) {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createDebouncedCallback } = usePerformanceOptimization();
  
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [processingTime, setProcessingTime] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Auto-save functionality
  const debouncedAutoSave = createDebouncedCallback((text: string) => {
    if (enableAutoSave && text.trim()) {
      setAutoSaveStatus('saving');
      // Simulate auto-save
      setTimeout(() => {
        localStorage.setItem('prompt-draft', text);
        setAutoSaveStatus('saved');
      }, 500);
    }
  }, 1000);

  // Load draft on mount
  useEffect(() => {
    if (enableAutoSave) {
      const draft = localStorage.getItem('prompt-draft');
      if (draft) {
        setPrompt(draft);
      }
    }
  }, [enableAutoSave]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    setAutoSaveStatus('unsaved');
    debouncedAutoSave(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Prompt tidak boleh kosong.",
        variant: "destructive"
      });
      return;
    }

    if (prompt.length > maxLength) {
      toast({
        title: "Error",
        description: `Prompt terlalu panjang. Maksimal ${maxLength} karakter.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const result = await onSubmit?.(prompt) || "Response placeholder - implement your AI logic here";
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setResponse(result);
      setProcessingTime(duration);
      
      // Add to history
      const historyItem: PromptHistory = {
        id: Date.now().toString(),
        prompt,
        response: result,
        timestamp: new Date(),
        processingTime: duration
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 items
      
      // Clear auto-save draft
      if (enableAutoSave) {
        localStorage.removeItem('prompt-draft');
        setAutoSaveStatus('saved');
      }
      
      toast({
        title: "Berhasil",
        description: `Prompt diproses dalam ${duration}ms`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memproses prompt. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
    setProcessingTime(0);
    if (enableAutoSave) {
      localStorage.removeItem('prompt-draft');
      setAutoSaveStatus('saved');
    }
  };

  const handleCopyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Berhasil",
        description: "Response berhasil disalin ke clipboard.",
      });
    }
  };

  const handleDownloadResponse = () => {
    if (response) {
      const blob = new Blob([response], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `response-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const loadFromHistory = (item: PromptHistory) => {
    setPrompt(item.prompt);
    setResponse(item.response);
    setProcessingTime(item.processingTime);
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'unsaved':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getAutoSaveText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Menyimpan...';
      case 'saved':
        return 'Tersimpan';
      case 'unsaved':
        return 'Belum tersimpan';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Main Input Card */}
      <Card className={`transition-all duration-300 ${isExpanded ? 'min-h-[600px]' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Prompt Input
            </CardTitle>
            <div className="flex items-center gap-2">
              {enableAutoSave && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getAutoSaveIcon()}
                  {getAutoSaveText()}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Prompt</label>
              {showWordCount && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Kata: {getWordCount(prompt)}</span>
                  <span>Karakter: {getCharacterCount(prompt)}/{maxLength}</span>
                </div>
              )}
            </div>
            
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder={placeholder}
              className={`min-h-[120px] resize-none transition-all duration-200 ${
                isExpanded ? 'min-h-[300px]' : ''
              } ${getCharacterCount(prompt) > maxLength ? 'border-red-500' : ''}`}
              maxLength={maxLength}
            />
            
            {getCharacterCount(prompt) > maxLength * 0.9 && (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                Mendekati batas maksimal karakter
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim() || getCharacterCount(prompt) > maxLength}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isLoading ? 'Memproses...' : 'Kirim Prompt'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
            
            {processingTime > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {processingTime}ms
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Card */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Response
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyResponse}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadResponse}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="max-h-[400px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {response}
              </div>
            </ScrollArea>
            
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Panjang response: {response.length} karakter</span>
              <span>Kata: {getWordCount(response)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Sidebar */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Prompt</CardTitle>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        #{history.length - index}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.processingTime}ms
                      </div>
                    </div>
                    
                    <p className="text-sm line-clamp-2 mb-2">
                      {item.prompt}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PromptInput;