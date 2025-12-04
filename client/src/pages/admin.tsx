import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowLeft, Download, RefreshCw, Users, Mail, Save, UserPlus, Trash2, LogOut, Shield } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  consent: boolean;
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  needsSetup: boolean;
  token: string | null;
}

function getAuthToken(): string | null {
  return localStorage.getItem("adminToken");
}

function setAuthToken(token: string): void {
  localStorage.setItem("adminToken", token);
}

function clearAuthToken(): void {
  localStorage.removeItem("adminToken");
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function LoginForm({ onSuccess }: { onSuccess: (user: AdminUser, token: string) => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Giriş başarısız");
      }
      
      const data = await response.json();
      setAuthToken(data.token);
      toast({ title: "Başarılı", description: "Giriş yapıldı." });
      onSuccess({ id: data.id, email: data.email, name: data.name, createdAt: "" }, data.token);
    } catch (error: any) {
      toast({ 
        title: "Hata", 
        description: error.message || "Giriş yapılamadı.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Yönetim Paneli</CardTitle>
          <CardDescription>Devam etmek için giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-login-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-login-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ 
        title: "Hata", 
        description: "Şifreler eşleşmiyor.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (password.length < 6) {
      toast({ 
        title: "Hata", 
        description: "Şifre en az 6 karakter olmalıdır.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kurulum başarısız");
      }
      
      toast({ title: "Başarılı", description: "Admin hesabı oluşturuldu. Şimdi giriş yapabilirsiniz." });
      onSuccess();
    } catch (error: any) {
      toast({ 
        title: "Hata", 
        description: error.message || "Kurulum yapılamadı.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">İlk Kurulum</CardTitle>
          <CardDescription>İlk admin hesabınızı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                placeholder="Admin Kullanıcı"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-setup-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-setup-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-setup-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                data-testid="input-setup-confirm-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-setup"
            >
              {isLoading ? "Oluşturuluyor..." : "Admin Hesabı Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notificationEmails, setNotificationEmails] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const { data: leads, isLoading: leadsLoading, refetch, isRefetching } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const response = await fetch("/api/leads", { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json();
    },
  });

  const { data: emailSettings } = useQuery<{ emails: string }>({
    queryKey: ["/api/settings/notification-emails"],
    queryFn: async () => {
      const response = await fetch("/api/settings/notification-emails", { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const { data: adminUsers, refetch: refetchAdmins } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Failed to fetch admins");
      return response.json();
    },
  });

  useEffect(() => {
    if (emailSettings?.emails !== undefined) {
      setNotificationEmails(emailSettings.emails);
    }
  }, [emailSettings]);

  const saveEmailsMutation = useMutation({
    mutationFn: async (emails: string) => {
      const response = await fetch("/api/settings/notification-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ emails }),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Kaydedildi", description: "E-posta adresleri güncellendi." });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/notification-emails"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Ayarlar kaydedilemedi.", variant: "destructive" });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create admin");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Başarılı", description: "Yeni admin oluşturuldu." });
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      refetchAdmins();
    },
    onError: (error: any) => {
      toast({ title: "Hata", description: error.message || "Admin oluşturulamadı.", variant: "destructive" });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, { 
        method: "DELETE", 
        headers: getAuthHeaders() 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete admin");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Silindi", description: "Admin kullanıcı silindi." });
      refetchAdmins();
    },
    onError: (error: any) => {
      toast({ title: "Hata", description: error.message || "Admin silinemedi.", variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", headers: getAuthHeaders() });
      clearAuthToken();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const exportToCSV = () => {
    if (!leads || leads.length === 0) return;
    
    const headers = ["Ad Soyad", "E-posta", "Telefon", "Tarih"];
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        `"${lead.fullName}"`,
        lead.email,
        lead.phone,
        format(new Date(lead.createdAt), "dd.MM.yyyy HH:mm", { locale: tr })
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `form-kayitlari-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.length < 6) {
      toast({ title: "Hata", description: "Şifre en az 6 karakter olmalıdır.", variant: "destructive" });
      return;
    }
    createAdminMutation.mutate({ name: newAdminName, email: newAdminEmail, password: newAdminPassword });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <h1 className="text-xl font-heading font-bold text-primary">Yönetim Paneli</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="leads" data-testid="tab-leads">Başvurular</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Ayarlar</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Kullanıcılar</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Başvuru Listesi</CardTitle>
                      <CardDescription>Toplam {leads?.length || 0} kayıt</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetch()}
                      disabled={isRefetching}
                      data-testid="button-refresh"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                      Yenile
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={exportToCSV}
                      disabled={!leads || leads.length === 0}
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV İndir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                ) : leads && leads.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ad Soyad</TableHead>
                          <TableHead>E-posta</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                            <TableCell className="font-medium">{lead.fullName}</TableCell>
                            <TableCell>
                              <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                                {lead.email}
                              </a>
                            </TableCell>
                            <TableCell>
                              <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                                {lead.phone}
                              </a>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm", { locale: tr })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Henüz kayıt bulunmuyor.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Bildirim Ayarları</CardTitle>
                    <CardDescription>Form gönderildiğinde bildirim alacak e-posta adresleri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-emails">E-posta Adresleri</Label>
                    <Input
                      id="notification-emails"
                      placeholder="ornek@email.com, diger@email.com"
                      value={notificationEmails}
                      onChange={(e) => setNotificationEmails(e.target.value)}
                      data-testid="input-notification-emails"
                    />
                    <p className="text-xs text-muted-foreground">Birden fazla adres için virgülle ayırın</p>
                  </div>
                  <Button
                    onClick={() => saveEmailsMutation.mutate(notificationEmails)}
                    disabled={saveEmailsMutation.isPending}
                    data-testid="button-save-emails"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveEmailsMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Yeni Admin Ekle</CardTitle>
                    <CardDescription>Panele erişebilecek yeni bir kullanıcı oluşturun</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="new-admin-name">Ad Soyad</Label>
                      <Input
                        id="new-admin-name"
                        placeholder="Ad Soyad"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        required
                        data-testid="input-new-admin-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-admin-email">E-posta</Label>
                      <Input
                        id="new-admin-email"
                        type="email"
                        placeholder="email@example.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        required
                        data-testid="input-new-admin-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-admin-password">Şifre</Label>
                      <Input
                        id="new-admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        required
                        data-testid="input-new-admin-password"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createAdminMutation.isPending}
                    data-testid="button-create-admin"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {createAdminMutation.isPending ? "Oluşturuluyor..." : "Admin Ekle"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Admin Kullanıcılar</CardTitle>
                    <CardDescription>Panele erişimi olan kullanıcılar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {adminUsers && adminUsers.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ad Soyad</TableHead>
                          <TableHead>E-posta</TableHead>
                          <TableHead>Oluşturulma</TableHead>
                          <TableHead className="w-[100px]">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map((admin) => (
                          <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                            <TableCell className="font-medium">{admin.name}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(admin.createdAt), "dd MMM yyyy", { locale: tr })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteAdminMutation.mutate(admin.id)}
                                disabled={admin.id === user.id || deleteAdminMutation.isPending}
                                data-testid={`button-delete-admin-${admin.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function Admin() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    needsSetup: false,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    setIsLoading(true);
    try {
      const setupResponse = await fetch("/api/auth/setup-status");
      const setupData = await setupResponse.json();
      
      if (setupData.needsSetup) {
        setAuthState({ isAuthenticated: false, user: null, needsSetup: true, token: null });
      } else {
        setAuthState({ isAuthenticated: false, user: null, needsSetup: false, token: null });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({ isAuthenticated: false, user: null, needsSetup: false, token: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: AdminUser, token: string) => {
    setAuthState({ isAuthenticated: true, user, needsSetup: false, token });
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuthState({ isAuthenticated: false, user: null, needsSetup: false, token: null });
  };

  const handleSetupSuccess = () => {
    setAuthState({ isAuthenticated: false, user: null, needsSetup: false, token: null });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (authState.needsSetup) {
    return <SetupForm onSuccess={handleSetupSuccess} />;
  }

  if (!authState.isAuthenticated || !authState.user) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard user={authState.user} onLogout={handleLogout} />;
}
