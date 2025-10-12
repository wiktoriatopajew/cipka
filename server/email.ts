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

// Send notification to USER when admin replies (with anti-spam protection)
export async function sendAdminReplyNotification(
  userEmail: string,
  username: string,
  adminMessage: string,
  sessionId: string
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Skipping admin reply email: SMTP not configured');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: userEmail, // Send to USER, not admin
      subject: `✉️ Chat With Mechanic - You have a reply from our expert`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔧 Chat With Mechanic</h1>
            <p style="color: #e8e8ff; margin: 10px 0 0 0; font-size: 16px;">Expert Reply</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <p style="font-size: 18px; color: #334155; margin: 0 0 20px 0;">Hi <strong>${username}</strong>! 👋</p>
            
            <p style="color: #64748b; margin: 0 0 20px 0; line-height: 1.6;">
              You have received a reply from our mechanic regarding your message:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; color: #334155; line-height: 1.6; font-size: 16px;">${adminMessage}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://chatwithmechanic.com" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                💬 Continue Conversation
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
              <p><strong>💡 Tip:</strong> Reply quickly to get the best assistance!</p>
              <p><strong>🔕 Notifications:</strong> You receive max. 1 email per 15 minutes during active conversation.</p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8;">
                Session ID: ${sessionId} | Chat With Mechanic - Online Automotive Expert
              </p>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`Admin reply notification sent to user: ${userEmail}`);
  } catch (error) {
    console.error('Failed to send admin reply notification:', error);
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