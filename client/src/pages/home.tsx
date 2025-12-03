import { Hero } from "@/components/sections/hero";
import { Curriculum } from "@/components/sections/curriculum";
import { Instructors } from "@/components/sections/instructors";
import { FAQ } from "@/components/sections/faq";
import { LeadForm } from "@/components/lead-form";
import { Phone, Mail, MapPin } from "lucide-react";
import flowLogo from "@assets/flow_logolar.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={flowLogo} alt="Flow Coaching Logo" className="h-20 w-auto object-contain" />
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="https://in-flowtr.com/hakkimizda/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Hakkımızda</a>
            <a href="https://in-flowtr.com/profesyonel-kocluk-sertifika-program-takvimi/liste/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Eğitim Takvimi</a>
            <a href="https://in-flowtr.com/sikca-sorulan-sorular/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">S.S.S.</a>
            <a href="/contact" className="text-primary font-semibold">İletişim</a>
          </div>
          
          <a href="tel:08503098604" className="hidden md:flex items-center gap-2 text-primary font-bold">
            <Phone size={18} className="fill-primary/10" />
            0850 309 86 04
          </a>
        </div>
      </header>

      <main className="flex-grow">
        <Hero />
        
        {/* Trust Indicators Bar */}
        <div className="bg-primary py-8">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-white/80 font-medium text-sm md:text-base">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">10+</span> Yıllık Deneyim
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">2000+</span> Mezun
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">ICF</span> Akredite Okul
            </div>
          </div>
        </div>

        <Curriculum />
        <Instructors />
        <FAQ />

        {/* Bottom CTA Section */}
        <section id="contact" className="py-20 bg-gradient-to-b from-white to-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-8">
                <h2 className="text-4xl font-heading font-bold text-primary">
                  Koçluk Yolculuğuna <br/>
                  <span className="text-accent">Bugün Başla</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hayatınızda ve kariyerinizde gerçek bir dönüşüm yaratmak için ilk adımı atın.
                  Eğitim danışmanlarımız tüm sorularınızı yanıtlamak için hazır.
                </p>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4 text-foreground/80">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone size={20} />
                    </div>
                    <span className="font-medium">0850 309 86 04</span>
                  </div>
                  <div className="flex items-center gap-4 text-foreground/80">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail size={20} />
                    </div>
                    <span className="font-medium">bilgi@in-flowtr.com</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-1 rounded-2xl shadow-xl border border-border/50">
                <LeadForm className="border-none shadow-none" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-sm text-slate-400">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg">FLOW Coaching</h4>
              <p>
                Uluslararası standartlarda koçluk ve liderlik eğitimleri ile potansiyelinizi açığa çıkarın.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Hızlı Erişim</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Ana Sayfa</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Eğitimler</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Yasal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Adres</h4>
              <p className="flex gap-2">
                <MapPin size={16} className="mt-1 shrink-0" />
                İstanbul, Türkiye<br/>
                (Online & Fiziksel Eğitimler)
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs">
            &copy; 2025 Flow Coaching Institute. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
