import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Bot, User, Loader2, UserPlus, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface Message {
  role: "user" | "assistant";
  content: string;
  isForm?: boolean;
}

interface ChatResponse {
  message: string;
}

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  consent: boolean;
}

const INITIAL_MESSAGE = "Merhaba! 👋 Koçluk eğitimi hakkında merak ettiğin her şeyi sana hızlıca anlatabilirim. ICF onaylı programımız, kariyer hedeflerine ulaşmanda sana nasıl yardımcı olabilir? Başlamak ister misin?";

export function AIChat({ className }: { className?: string }) {
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: INITIAL_MESSAGE }
  ]);
  const [input, setInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: "",
    email: "",
    phone: "",
    consent: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, showForm]);

  // Show form after 2 user messages
  useEffect(() => {
    if (messageCount >= 2 && !showForm && !formSubmitted) {
      setShowForm(true);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Seni daha iyi destekleyebilmem için iletişim bilgilerini alabilir miyim? Aşağıdaki formu doldurarak ön kayıt yaptırabilirsin! 👇",
        isForm: true
      }]);
    }
  }, [messageCount, showForm, formSubmitted]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string): Promise<ChatResponse> => {
      const newMessages = [...messages.filter(m => !m.isForm), { role: "user" as const, content: userMessage }];
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      if (!response.ok) {
        throw new Error("Mesaj gönderilemedi");
      }
      
      return response.json();
    },
    onMutate: (userMessage) => {
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      setInput("");
      setMessageCount(prev => prev + 1);
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." 
      }]);
    },
  });

  const leadMutation = useMutation({
    mutationFn: async (data: LeadFormData & { recaptchaToken?: string }) => {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Form gönderilemedi");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setFormSubmitted(true);
      setShowForm(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "🎉 Harika! Bilgilerin başarıyla kaydedildi. Eğitim danışmanlarımız en kısa sürede seninle iletişime geçecek. Başka sorularını yanıtlamaya devam edebilirim!" 
      }]);
      toast({
        title: "Başarılı!",
        description: "Bilgileriniz kaydedildi. En kısa sürede sizinle iletişime geçeceğiz.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate(input.trim());
  };

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.consent) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen tüm alanları doldurun ve onay kutusunu işaretleyin.",
        variant: "destructive",
      });
      return;
    }
    
    let recaptchaToken: string | undefined;
    
    if (executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha("lead_form_chat");
      } catch (error) {
        console.error("reCAPTCHA error:", error);
      }
    }
    
    leadMutation.mutate({ ...formData, recaptchaToken });
  }, [formData, executeRecaptcha, leadMutation, toast]);

  return (
    <div className={`bg-card rounded-xl shadow-lg border border-border/50 flex flex-col ${className || 'h-[550px]'}`}>
      <div className="bg-primary text-white px-6 py-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold">Flow Eğitim Danışmanı</h3>
            <p className="text-xs text-white/70">Koçluk eğitimi hakkında sorularınızı yanıtlıyorum</p>
          </div>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              message.role === "user" 
                ? "bg-accent text-white" 
                : "bg-primary/10 text-primary"
            }`}>
              {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === "user"
                ? "bg-accent text-white rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Inline Contact Form */}
        {showForm && !formSubmitted && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserPlus size={16} />
            </div>
            <div className="flex-1 max-w-[85%]">
              <form onSubmit={handleFormSubmit} className="bg-white border border-primary/20 rounded-xl p-4 shadow-sm space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="chat-name" className="text-xs font-medium">Ad Soyad</Label>
                  <Input
                    id="chat-name"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Adınız ve soyadınız"
                    className="h-9 text-sm"
                    data-testid="input-chat-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chat-email" className="text-xs font-medium">E-posta</Label>
                  <Input
                    id="chat-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@email.com"
                    className="h-9 text-sm"
                    data-testid="input-chat-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chat-phone" className="text-xs font-medium">Telefon</Label>
                  <Input
                    id="chat-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05XX XXX XX XX"
                    className="h-9 text-sm"
                    data-testid="input-chat-phone"
                  />
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="chat-consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked === true }))}
                    data-testid="checkbox-chat-consent"
                  />
                  <Label htmlFor="chat-consent" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                    KVKK kapsamında bilgilerimin işlenmesini kabul ediyorum
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 h-9 text-sm"
                  disabled={leadMutation.isPending}
                  data-testid="button-chat-submit"
                >
                  {leadMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Ön Kayıt Yap
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {chatMutation.isPending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Yazıyor...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleChatSubmit} className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesajınızı yazın..."
            disabled={chatMutation.isPending}
            className="flex-1"
            data-testid="input-chat"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-accent hover:bg-accent/90"
            data-testid="button-send"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
