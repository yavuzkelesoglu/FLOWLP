import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Brain, Target, Sparkles, Trophy, Microscope, Award } from "lucide-react";

const modules = [
  {
    id: "item-1",
    title: "1) Farkındalık",
    desc: "Etik & prensipler, güven kurma, anlaşma, etkili hedef belirleme ve gelecek planlama.",
    icon: Brain
  },
  {
    id: "item-2",
    title: "2) Motivasyon",
    desc: "İç engelleri keşfetme, danışanda sürdürülebilir motivasyon yaratma.",
    icon: Sparkles
  },
  {
    id: "item-3",
    title: "3) Yaratıcı Planlama",
    desc: "Çözüm üretme, kişisel ve profesyonel hedeflere ulaşma için uygulamalı araçlar.",
    icon: Target
  },
  {
    id: "item-4",
    title: "4) Başarı",
    desc: "Başarı vizyonu, sonuç odaklı metodoloji, FLOW modelinde derinleşme.",
    icon: Trophy
  },
  {
    id: "item-5",
    title: "5) Odaklanma",
    desc: "Odak & dayanıklılık; koç duruşunu kısa-orta-uzun vadede güçlendirme.",
    icon: Microscope
  },
  {
    id: "item-6",
    title: "6) Usta Koçluk Yolu",
    desc: "Praktikum, süpervizyon, mentor koçluk; ACC/PCC başvuru yolunda destek.",
    icon: Award
  }
];

export function Curriculum() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
            Eğitim Modülleri
          </h2>
          <p className="text-muted-foreground text-lg">
            ICF temel yetkinliklerini kapsayan, teori ve pratiği birleştiren kapsamlı müfredat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <p className="text-lg text-foreground/80 leading-relaxed">
              Bu program, katılımcılara profesyonel koçluk mesleğinin temellerini atarken, 
              aynı zamanda kendi liderlik ve iletişim becerilerini de en üst seviyeye çıkarma fırsatı sunar.
              <br/><br/>
              Her bir modül, uluslararası standartlarda tasarlanmış olup, katılımcıların
              anında uygulayabileceği pratik araçlarla donatılmıştır.
            </p>
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
              <h4 className="font-bold text-primary mb-4 text-lg">Kimler İçin?</h4>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground block mb-0.5">Profesyonel Koç Adayları</strong>
                    Uluslararası geçerliliğe sahip bir sertifika ile yeni bir kariyere adım atmak isteyenler.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground block mb-0.5">Yöneticiler ve Liderler</strong>
                    Takımlarını daha etkili yönetmek ve liderlik becerilerini koçluk yetkinlikleriyle güçlendirmek isteyenler.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground block mb-0.5">İK ve Eğitim Profesyonelleri</strong>
                    Kurum içi gelişim süreçlerini desteklemek ve çalışan potansiyelini açığa çıkarmak isteyen uzmanlar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-foreground block mb-0.5">Danışmanlar ve Eğitmenler</strong>
                    Hizmet yelpazesini genişleterek danışanlarına daha derinlemesine destek sunmak isteyenler.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <Accordion type="single" collapsible className="w-full">
              {modules.map((mod) => (
                <AccordionItem key={mod.id} value={mod.id}>
                  <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-4 rounded-lg transition-colors">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <mod.icon size={20} />
                      </div>
                      <span className="font-heading font-semibold text-lg">{mod.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4 text-muted-foreground ml-14">
                    {mod.desc}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
