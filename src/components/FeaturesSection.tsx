import FeatureCard from "./FeatureCard";
import { Camera, Video, Code2 } from "lucide-react";

const FeaturesSection = () => {
  const optimizeImagePrompt = (input: string): string => {
    const basePrompt = input.trim();
    return `${basePrompt}, highly detailed, professional photography, studio lighting, sharp focus, 8K resolution, cinematic composition, vibrant colors, masterpiece quality, trending on artstation, photorealistic rendering, perfect anatomy, dramatic lighting, depth of field, ultra-wide angle, hyper-realistic textures, award-winning photography`;
  };

  const optimizeVideoPrompt = (input: string): string => {
    const basePrompt = input.trim();
    return `${basePrompt}, cinematic sequence, smooth camera movement, professional videography, 4K ultra HD, 60fps, dynamic transitions, establishing shot to close-up, balanced composition, color grading, dramatic lighting transitions, seamless cuts, depth of field changes, cinematic color palette, professional audio sync, Hollywood-style production value, trending on film festivals`;
  };

  const optimizeCodePrompt = (input: string): string => {
    const basePrompt = input.trim();
    
    // Extract what they want to build
    const codeType = basePrompt.toLowerCase();
    
    if (codeType.includes('kalkulator')) {
      return `Buatkan aplikasi kalkulator lengkap menggunakan Python 3.9+ dengan library Tkinter untuk GUI. Fitur yang harus ada:

1. Operasi matematika dasar: penjumlahan (+), pengurangan (-), perkalian (*), pembagian (/)
2. Operasi lanjutan: pangkat (**), akar kuadrat, persen (%)
3. Fungsi memori: M+, M-, MR, MC
4. History perhitungan yang bisa dilihat
5. Validasi input untuk mencegah error
6. Interface yang user-friendly dengan button grid
7. Keyboard shortcuts untuk semua operasi
8. Error handling untuk pembagian dengan nol
9. Display yang menampilkan operasi dan hasil
10. Fungsi clear (C) dan clear entry (CE)

Struktur kode:
- Class Calculator untuk logika perhitungan
- Class CalculatorGUI untuk interface
- Fungsi terpisah untuk setiap operasi
- Exception handling yang comprehensive
- Dokumentasi lengkap untuk setiap fungsi
- Type hints untuk semua parameter dan return values

Berikan komentar detail dalam bahasa Indonesia untuk setiap fungsi dan logika penting.`;
    }
    
    // Generic code optimization
    return `${basePrompt}. 

Spesifikasi teknis yang dibutuhkan:
1. Bahasa pemrograman: [tentukan bahasa yang paling sesuai]
2. Versi: [gunakan versi terbaru yang stabil]
3. Framework/Library: [sebutkan yang diperlukan]
4. Arsitektur: [MVC, Clean Architecture, atau pattern yang sesuai]
5. Error handling: implementasi try-catch yang comprehensive
6. Validasi input: validasi semua input user
7. Testing: sertakan unit test untuk fungsi utama
8. Documentation: komentar lengkap dalam bahasa Indonesia
9. Type hints/annotations: gunakan untuk semua fungsi
10. Best practices: ikuti coding standards dan conventions
11. Security: implementasi security measures jika diperlukan
12. Performance: optimasi kode untuk performa terbaik

Struktur file yang diharapkan:
- Pisahkan logika bisnis dari presentation layer
- Gunakan design patterns yang appropriate
- Modular code structure
- Consistent naming conventions
- Proper imports dan dependencies management

Berikan output berupa kode lengkap yang siap dijalankan dengan dokumentasi yang comprehensive.`;
  };

  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tiga alat canggih untuk mengoptimalkan prompt AI Anda dengan hasil yang lebih detail dan berkualitas tinggi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Pengoptimal Gambar"
            description="Tingkatkan prompt gambar dengan detail artistik, pencahayaan, dan resolusi untuk AI seperti Midjourney atau DALL-E"
            placeholder="Contoh: gambaran pemandangan gunung di pagi hari"
            icon={<Camera className="w-8 h-8 text-primary" />}
            optimizeFunction={optimizeImagePrompt}
          />
          
          <FeatureCard
            title="Pengoptimal Video"
            description="Optimalkan prompt video dengan deskripsi adegan detail, pergerakan kamera, dan efek sinematik"
            placeholder="Contoh: video orang berjalan di pantai saat sunset"
            icon={<Video className="w-8 h-8 text-primary" />}
            optimizeFunction={optimizeVideoPrompt}
          />
          
          <FeatureCard
            title="Pengoptimal Kode"
            description="Transformasi prompt Indonesia menjadi spesifikasi kode yang terstruktur dan detail untuk AI coding"
            placeholder="Contoh: buatkan kode kalkulator sederhana"
            icon={<Code2 className="w-8 h-8 text-primary" />}
            optimizeFunction={optimizeCodePrompt}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;