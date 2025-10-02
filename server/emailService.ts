import nodemailer from 'nodemailer';

// Email notification service
const ADMIN_EMAIL = 'wiktoriatopajew@gmail.com';

// Create reusable transporter
const createTransporter = () => {
  // Configure SMTP transporter
  // For production, use environment variables for credentials
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface ChatMessageEmailData {
  userEmail: string;
  userName: string;
  messageContent: string;
  sessionId: string;
  isFirstMessage?: boolean;
}

export async function sendFirstMessageNotification(data: ChatMessageEmailData) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: ADMIN_EMAIL,
    subject: `🔔 Nowa pierwsza wiadomość od ${data.userName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nowa pierwsza wiadomość na czacie!</h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Użytkownik:</strong> ${data.userName}</p>
          <p><strong>Email:</strong> ${data.userEmail}</p>
          <p><strong>ID sesji:</strong> ${data.sessionId}</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Treść wiadomości:</strong></p>
          <p style="color: #1976d2; font-size: 16px;">${data.messageContent}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          To jest pierwsza wiadomość tego użytkownika. Odpowiedz jak najszybciej!
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('First message email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending first message email:', error);
    throw error;
  }
}

export async function sendFollowUpNotification(data: ChatMessageEmailData) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: ADMIN_EMAIL,
    subject: `⏰ Przypomnienie - wiadomość od ${data.userName} sprzed 5 minut`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Przypomnienie o wiadomości</h2>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;">Użytkownik <strong>${data.userName}</strong> wysłał wiadomość 5 minut temu i może czekać na odpowiedź.</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Użytkownik:</strong> ${data.userName}</p>
          <p><strong>Email:</strong> ${data.userEmail}</p>
          <p><strong>ID sesji:</strong> ${data.sessionId}</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Treść wiadomości:</strong></p>
          <p style="color: #1976d2; font-size: 16px;">${data.messageContent}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Sprawdź czy klient otrzymał odpowiedź na swoje pytanie.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Follow-up email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    throw error;
  }
}

// Schedule follow-up email after 5 minutes
export function scheduleFollowUpEmail(data: ChatMessageEmailData) {
  setTimeout(async () => {
    try {
      await sendFollowUpNotification(data);
    } catch (error) {
      console.error('Failed to send scheduled follow-up email:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
}
