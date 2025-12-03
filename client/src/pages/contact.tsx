import { Mail, Phone, MapPin } from "lucide-react";
import { LeadForm } from "@/components/lead-form";

export default function Contact() {
  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">İletişim</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Sorularınız için bize ulaşın. Eğitim danışmanlarımız size yardımcı olmaktan mutluluk duyacaktır.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Bizi Arayın</h3>
                  <p className="text-muted-foreground">0 (850) 309 86 04</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">E-Posta</h3>
                  <p className="text-muted-foreground">bilgi@in-flowtr.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <MapPin size={24} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Merkez</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Flow Coaching Institute Türkiye<br/>
                    Kanlıca Mah. Hacı Muhittin Sok. No: 48/1<br/>
                    34810 Beykoz / İstanbul
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Ofis</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Maslak, Büyükdere Cad. No:255<br/>
                    Nurol Plaza B.02-A6<br/>
                    34450 Sarıyer - İstanbul
                  </p>
                </div>
              </div>
            </div>

            {/* Map Embed Mockup (Image or Iframes are tricky in mockup mode, using placeholder styled div) */}
            <div className="w-full h-64 bg-slate-200 rounded-xl overflow-hidden relative">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.9425678849463!2d29.0633443!3d41.0701743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caca26141e3c81%3A0x663707237702970d!2sFlow%20Coaching%20Institute!5e0!3m2!1sen!2str!4v1701345678901!5m2!1sen!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Form */}
          <div>
             <div className="bg-white p-1 rounded-2xl shadow-xl border border-border/50 sticky top-24">
                <LeadForm className="border-none shadow-none" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
