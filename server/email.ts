import nodemailer from 'nodemailer';

const NOTIFICATION_EMAIL = 'wiktoriatopajew@gmail.com';

// Create transporter function (lazy loading after env vars are loaded)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Verify transporter configuration on startup
// Note: SMTP verification moved to index.ts after dotenv.config()
// if (process.env.SMTP_USER && process.env.SMTP_PASS) {
//   transporter.verify((error: Error | null, success: boolean) => {
//     if (error) {
//       console.log('Email configuration error:', error);
//     } else {
//       console.log('Email server ready to send messages');
//     }
//   });
// } else {
//   console.log('Email notifications disabled: SMTP credentials not configured');
// }

export async function sendUserLoginNotification(username: string, email: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping email: SMTP not configured');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `✅ New User Login - ${username}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">New User Login</h2>
          <p>A user has logged into ChatWithMechanic.com:</p>
          <ul>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
      `,
    });
    console.log('Login notification sent');
  } catch (error) {
    console.error('Failed to send login notification:', error);
  }
}

export async function sendFirstMessageNotification(
  username: string,
  email: string,
  message: string,
  sessionId: string
) {
  console.log('sendFirstMessageNotification called for:', username);
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping email: SMTP not configured');
    return;
  }

  try {
    console.log('Creating transporter and sending email...');
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `AutoMentor Chat - Session: ${sessionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">User Started First Chat</h2>
          <p><strong>${username}</strong> (${email}) has sent their first message:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p><strong>Session ID:</strong> ${sessionId}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            <strong>To respond:</strong> Simply reply to this email. Your response will automatically appear in the user's chat.
          </p>
        </div>
      `,
    });
    console.log('First message notification sent');
  } catch (error) {
    console.error('Failed to send first message notification:', error);
  }
}

export async function sendSubsequentMessageNotification(
  username: string,
  email: string,
  message: string,
  sessionId: string,
  messageCount: number
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping email: SMTP not configured');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `AutoMentor Chat - Session: ${sessionId} - Message #${messageCount}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">New Message from User</h2>
          <p><strong>${username}</strong> (${email}) sent message #${messageCount}:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p><strong>Session ID:</strong> ${sessionId}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            <strong>To respond:</strong> Simply reply to this email. Your response will automatically appear in the user's chat.
          </p>
        </div>
      `,
    });
    console.log('Subsequent message notification sent');
  } catch (error) {
    console.error('Failed to send subsequent message notification:', error);
  }
}

export async function sendChatActivityNotification(
  username: string,
  email: string,
  sessionId: string,
  messageCount: number,
  durationMinutes: number
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping email: SMTP not configured');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `🔔 Chat Active ${durationMinutes}min - ${username}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0EA5E9;">Chat Activity Alert</h2>
          <p><strong>${username}</strong> (${email}) is still chatting:</p>
          <ul>
            <li><strong>Duration:</strong> ${durationMinutes} minutes</li>
            <li><strong>Messages sent:</strong> ${messageCount}</li>
            <li><strong>Session ID:</strong> ${sessionId}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #64748b;">This is a periodic notification sent every 15 minutes while the chat is active.</p>
        </div>
      `,
    });
    console.log(`Chat activity notification sent (${durationMinutes}min)`);
  } catch (error) {
    console.error('Failed to send chat activity notification:', error);
  }
}

export async function sendContactFormEmail(name: string, email: string, subject: string, message: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping email: SMTP not configured');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFICATION_EMAIL,
      subject: `📧 Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #059669;">New Contact Form Message</h2>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            Sent from AutoMentor Contact Form on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
    console.log(`Contact form email sent from ${email}`);
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    throw error;
  }
}