import { AIChat } from "../ai-chat";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/professional_coaching_session_in_a_modern,_bright_office_environment..png";

export function HeroChat() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-background overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Coaching Session" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white space-y-6 max-w-2xl order-2 lg:order-1"
          >
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium tracking-wide mb-2 border border-white/30">
              ICF Onaylı • Level 1 & Level 2
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
              ICF Onaylı <br/>
              <span className="text-accent">Online Koçluk Eğitimi</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light max-w-xl">
              Uluslararası geçerliliğe sahip profesyonel koçluk sertifikası ile kariyerinizde yeni bir sayfa açın. 
              Farkındalık, motivasyon ve liderlik yetkinliklerinizi dönüştürün.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/90 text-sm md:text-base">
                💬 <span className="font-semibold">Yapay Zeka Eğitim Danışmanımız</span> ile hemen sohbet edin! 
                Tüm sorularınızı yanıtlasın ve size özel bilgi versin.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-8 text-sm font-medium text-white/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Sadece Online
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Mentorluk Desteği
              </div>
            </div>
          </motion.div>

          {/* AI Chat Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full order-1 lg:order-2"
          >
            <AIChat className="h-[520px]" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
