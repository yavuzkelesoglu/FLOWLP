import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

import ayhanImage from "@assets/ayhan-dayoglu.jpeg";
import ozlemImage from "@assets/ozlem-koparan.png";
import ipekImage from "@assets/ipek-citak.png";

const instructors = [
  {
    name: "Ayhan Dayoğlu",
    title: "FCPC / ICF PCC",
    role: "Kurucu / Eğitmen",
    desc: "FLOW Coaching Institute Kurucusu. Unleash Your Creative Potential Towards Positive Shift-ACTP program lideri.",
    image: ayhanImage
  },
  {
    name: "Özlem Koparan",
    title: "FCPC / ICF PCC",
    role: "Eğitmen Koç",
    desc: "Euroasian Gestalt Coaching Program ve Flow Team Coaching programlarında uzmanlaşmış deneyimli eğitmen.",
    image: ozlemImage
  },
  {
    name: "İpek Çıtak",
    title: "FCPC / ICF ACC",
    role: "Eğitmen Koç",
    desc: "Profesyonel koçluk kariyerinde yüzlerce saatlik deneyimiyle katılımcılara rehberlik etmektedir.",
    image: ipekImage
  }
];

export function Instructors() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
            Eğitmen Koçlar
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Global deneyime sahip, ICF unvanlı uzman kadromuzla tanışın.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {instructors.map((inst, i) => (
            <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-6 border-4 border-muted group-hover:border-accent transition-colors shadow-md">
                  <AvatarImage src={inst.image} alt={inst.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-2xl font-heading font-bold">
                    {inst.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{inst.name}</h3>
                <p className="text-accent font-medium text-sm mb-4">{inst.title}</p>
                
                <div className="w-12 h-1 bg-muted rounded-full mb-4 group-hover:bg-accent transition-colors" />
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {inst.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
