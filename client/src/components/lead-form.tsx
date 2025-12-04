import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useCallback } from "react";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Ad Soyad en az 2 karakter olmalıdır."),
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz."),
  phone: z
    .string()
    .trim()
    .min(10, "Geçerli bir telefon numarası giriniz."),
  consent: z.boolean().refine((val) => val === true, {
    message: "Devam etmek için onayı kabul etmelisiniz.",
  }),
});

export function LeadForm({ className, variant = "default" }: { className?: string, variant?: "default" | "compact" }) {
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      consent: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema> & { recaptchaToken?: string }) => {
      const normalizedValues = {
        ...values,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedValues),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Form gönderilemedi");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Google Ads Conversion Tracking - Form gönderimi
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-11258697181/UKELCIGryMkbEN2ryPgp'
        });
      }
      
      toast({
        title: "Başvurunuz Alındı!",
        description: "Eğitim danışmanlarımız en kısa sürede size ulaşacaktır.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    let recaptchaToken: string | undefined;
    
    if (executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha("lead_form");
      } catch (error) {
        console.error("reCAPTCHA error:", error);
      }
    }
    
    submitMutation.mutate({ ...values, recaptchaToken });
  }, [executeRecaptcha, submitMutation]);

  return (
    <div className={`bg-card p-6 rounded-xl shadow-lg border border-border/50 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-heading font-bold text-primary">Bilgi & Kayıt Formu</h3>
        <p className="text-muted-foreground text-sm mt-2">
          Program detayları ve erken kayıt avantajları için formu doldurun.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Adınız Soyadınız" {...field} data-testid="input-fullname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input placeholder="ornek@email.com" {...field} data-testid="input-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="05XX XXX XX XX" {...field} data-testid="input-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-consent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-xs font-normal text-muted-foreground">
                    Flow Coaching & Leadership Institute ile ilgili gelişmelerden haberdar olmak istiyorum. 
                    KVKK metnini okudum ve onaylıyorum.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-6 text-lg shadow-md transition-transform hover:scale-[1.02]"
            disabled={submitMutation.isPending}
            data-testid="button-submit"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Hemen Başvur"
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            Bu site reCAPTCHA ile korunmaktadır.
          </p>
        </form>
      </Form>
    </div>
  );
}
