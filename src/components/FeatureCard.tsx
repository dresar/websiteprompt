import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureCardProps {
  title: string;
  description: string;
  placeholder: string;
  icon: React.ReactNode;
  optimizeFunction: (input: string) => string;
}

const FeatureCard = ({ title, description, placeholder, icon, optimizeFunction }: FeatureCardProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!input.trim()) {
      toast({
        title: "Input kosong",
        description: "Silakan masukkan prompt yang ingin dioptimalkan.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const optimizedPrompt = optimizeFunction(input);
    setOutput(optimizedPrompt);
    setIsOptimizing(false);

    toast({
      title: "Prompt berhasil dioptimalkan!",
      description: "Prompt Anda telah ditingkatkan dengan detail yang lebih baik.",
    });
  };

  const handleCopy = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
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

  return (
    <Card className="h-full gradient-card shadow-soft hover:shadow-medium transition-all duration-300 border-0">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="text-2xl font-semibold text-primary mb-2">{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Prompt Asli
          </label>
          <Textarea
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] resize-none border-border focus:ring-primary focus:border-primary"
          />
        </div>
        
        <Button 
          onClick={handleOptimize}
          disabled={isOptimizing || !input.trim()}
          className="w-full gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          {isOptimizing ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Mengoptimalkan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Optimalkan
            </>
          )}
        </Button>
        
        {output && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Prompt yang Dioptimalkan
            </label>
            <div className="relative">
              <Textarea
                value={output}
                readOnly
                className="min-h-[120px] resize-none bg-secondary/50 border-border"
              />
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;