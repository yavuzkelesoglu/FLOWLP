import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Program ICF onaylı mı?",
    a: "Evet, program ICF Level 1 & Level 2 kapsamındadır. Mezunlar, ACC/PCC yolunda gerekli eğitim saatlerini tamamlamış olurlar."
  },
  {
    q: "Eğitim formatı nedir?",
    a: "Eğitimlerimiz Zoom Platformu üzerinde online interaktif olarak gerçekleştirilmektedir."
  },
  {
    q: "Mentorluk ve süpervizyon var mı?",
    a: "Evet. Program kapsamında praktikum, süpervizyon ve mentor koçluk desteği süreçte aktif olarak yer alır."
  },
  {
    q: "Kimler katılabilir?",
    a: "Koçluk mesleğine ilgi duyan herkes; liderler, yöneticiler, İK profesyonelleri, öğretmenler ve kişisel gelişimine yatırım yapmak isteyen herkes katılabilir."
  }
];

export function FAQ() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white border px-6 rounded-lg shadow-sm">
              <AccordionTrigger className="text-lg font-medium text-foreground/90 py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-base">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
