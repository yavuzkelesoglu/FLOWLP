import { Resend } from "resend";
import { storage } from "./storage";

interface LeadData {
  fullName: string;
  email: string;
  phone: string;
}

export async function sendLeadNotification(lead: LeadData): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured. Skipping email notification.");
      return false;
    }
    
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Flow Coaching <bilgi@in-flowtr.com>";
    const resend = new Resend(apiKey);
    
    // Get notification emails from settings
    const emailsSetting = await storage.getSetting("notification_emails");
    
    if (!emailsSetting || emailsSetting.trim() === "") {
      console.log("No notification emails configured, skipping email");
      return false;
    }
    
    // Parse comma-separated emails and clean them
    const toEmails = emailsSetting
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes("@"));
    
    if (toEmails.length === 0) {
      console.log("No valid notification emails found, skipping email");
      return false;
    }
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmails,
      subject: `Yeni Form Başvurusu: ${lead.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">
            Yeni Form Başvurusu
          </h2>
          <p style="font-size: 16px; color: #333;">
            Flow Temel Koçluk Okulu için yeni bir başvuru alındı:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold; width: 120px;">Ad Soyad</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${lead.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">E-posta</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <a href="mailto:${lead.email}" style="color: #0d9488;">${lead.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Telefon</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <a href="tel:${lead.phone}" style="color: #0d9488;">${lead.phone}</a>
              </td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Bu e-posta Flow Coaching & Leadership Institute web sitesinden otomatik olarak gönderilmiştir.
          </p>
        </div>
      `
    });
    
    console.log('Email sent successfully to:', toEmails, result);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}
