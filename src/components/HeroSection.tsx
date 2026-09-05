import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-primary/90" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Pengoptimal
          <span className="block gradient-hero bg-clip-text text-transparent">
            Prompt
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-light">
          Transformasi prompt sederhana menjadi instruksi detail dan efektif untuk AI. 
          Tingkatkan kualitas hasil AI gambar, video, dan kode Anda.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={scrollToFeatures}
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-medium px-8 py-3 text-lg"
          >
            Mulai Optimalkan
          </Button>
          <Button 
            onClick={scrollToFeatures}
            variant="outline" 
            size="lg"
            className="border-white text-white hover:bg-white hover:text-primary font-medium px-8 py-3 text-lg"
          >
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;