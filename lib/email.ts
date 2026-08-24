import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { env } from "./env";

let transporter: Transporter | null = null;

function createTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.email.smtpHost,
    port: env.email.smtpPort,
    secure: env.email.smtpSecure,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });

  return transporter;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const mailTransporter = createTransporter();

    const mailOptions: SendMailOptions = {
      from: `"Pannon Transfer" <${env.email.user}>`,
      to: options.to,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    if (options.html) {
      mailOptions.html = options.html;
    } else if (options.text) {
      mailOptions.text = options.text;
    }

    const info = await mailTransporter.sendMail(mailOptions);

    console.log(`[EMAIL SIKERES] E-mail elküldve: ${info.messageId}`);
    console.log(`[EMAIL] Előzetes URL: ${nodemailer.getTestMessageUrl(info)}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ismeretlen hiba történt";
    console.error(`[EMAIL HIBA] E-mail küldés sikertelen: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const mailTransporter = createTransporter();
    await mailTransporter.verify();
    console.log("[EMAIL] SMTP kapcsolat sikeresen ellenőrizve.");
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ismeretlen hiba történt";
    console.error(
      `[EMAIL HIBA] SMTP kapcsolat ellenőrzése sikertelen: ${errorMessage}`
    );
    return false;
  }
}

export function formatBookingEmail(params: {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleType?: string;
  price?: string;
  notes?: string;
}): { subject: string; html: string } {
  const subject = `Foglalás megerősítés - ${params.bookingId}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%); color: #ffffff;">
      <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #d4af37;">
        <h1 style="color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 1px;">Pannon Transfer</h1>
        <p style="color: #a0aec0; margin: 10px 0 0 0;">Prémium szállítási szolgáltatások</p>
      </div>
      
      <div style="padding: 30px 0;">
        <h2 style="color: #d4af37; font-size: 22px; margin: 0 0 20px 0;">Kedves ${params.customerName}!</h2>
        <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Köszönjük foglalását! Alább találja a foglalásának részleteit:
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 25px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">FOGLALÁS AZONOSÍTÓ</p>
              <p style="color: #d4af37; font-size: 18px; font-weight: bold; margin: 0;">${params.bookingId}</p>
            </div>
            <div>
              <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">UTASOK SZÁMA</p>
              <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0;">${params.passengers} fő</p>
            </div>
          </div>
          
          <div style="height: 1px; background: rgba(212, 175, 55, 0.2); margin: 20px 0;"></div>
          
          <div style="margin: 15px 0;">
            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">INDULÁS</p>
            <p style="color: #ffffff; font-size: 16px; margin: 0;">📍 ${params.pickupLocation}</p>
            <p style="color: #d4af37; font-size: 14px; margin: 5px 0 0 0;">📅 ${params.pickupDate} - ⏰ ${params.pickupTime}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">ÉRKEZÉS</p>
            <p style="color: #ffffff; font-size: 16px; margin: 0;">🏁 ${params.dropoffLocation}</p>
          </div>
          
          ${params.vehicleType ? `
          <div style="margin: 20px 0;">
            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">JÁRMŰ TÍPUSA</p>
            <p style="color: #ffffff; font-size: 16px; margin: 0;">🚗 ${params.vehicleType}</p>
          </div>
          ` : ""}
          
          ${params.price ? `
          <div style="margin: 20px 0;">
            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">ÁR</p>
            <p style="color: #d4af37; font-size: 22px; font-weight: bold; margin: 0;">${params.price}</p>
          </div>
          ` : ""}
          
          ${params.notes ? `
          <div style="margin: 20px 0;">
            <p style="color: #a0aec0; font-size: 13px; margin: 0 0 5px 0;">MEGJEGYZÉS</p>
            <p style="color: #ffffff; font-size: 14px; margin: 0; font-style: italic;">${params.notes}</p>
          </div>
          ` : ""}
        </div>
        
        <p style="color: #a0aec0; font-size: 14px; line-height: 1.6; margin: 20px 0;">
          Amennyiben bármilyen kérdése van, vagy módosítani szeretné a foglalását, kérjük lépjen kapcsolatba velünk:
        </p>
        <div style="background: rgba(212, 175, 55, 0.1); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="color: #d4af37; font-size: 16px; font-weight: bold; margin: 0;">📧 ${env.email.user}</p>
        </div>
      </div>
      
      <div style="border-top: 2px solid #d4af37; padding-top: 20px; text-align: center;">
        <p style="color: #a0aec0; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Pannon Transfer. Minden jog fenntartva.
        </p>
        <p style="color: #718096; font-size: 11px; margin: 10px 0 0 0;">
          Ez egy automatikus e-mail, kérjük ne válaszoljon rá.
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}
