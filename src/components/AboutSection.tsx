import { Target, Zap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutSection = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Presisi Tinggi",
      description: "Algoritma canggih untuk menganalisis dan meningkatkan kualitas prompt dengan akurasi maksimal"
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Proses Cepat",
      description: "Optimasi prompt dalam hitungan detik dengan hasil yang konsisten dan berkualitas"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Mudah Digunakan",
      description: "Interface intuitif yang dirancang untuk semua level pengguna, dari pemula hingga profesional"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Tentang Pengoptimal Prompt
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Pengoptimal Prompt adalah platform inovatif yang dirancang khusus untuk meningkatkan 
            kualitas interaksi Anda dengan AI. Kami memahami bahwa prompt yang baik adalah kunci 
            untuk mendapatkan hasil AI yang optimal, baik untuk gambar, video, maupun kode.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center gradient-card shadow-soft hover:shadow-medium transition-all duration-300 border-0">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-primary mb-4">
            Mengapa Memilih Pengoptimal Prompt?
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Dengan pengalaman bertahun-tahun dalam bidang AI dan machine learning, tim kami 
            telah mengembangkan algoritma yang dapat memahami konteks dan nuansa bahasa Indonesia 
            dengan sempurna. Kami berkomitmen untuk membantu Anda mencapai hasil AI terbaik 
            melalui prompt yang dioptimalkan secara profesional.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Prompt Dioptimalkan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Tingkat Kepuasan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Dukungan Tersedia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;