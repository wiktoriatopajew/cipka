import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailConfiguration() {
  try {
    console.log('📧 Testing email configuration...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self
      subject: 'AutoMentor - Email Configuration Test',
      text: 'This is a test email to verify your email configuration is working correctly.',
      html: `
        <h2>AutoMentor Email Test</h2>
        <p>✅ Your email configuration is working correctly!</p>
        <p>Server details:</p>
        <ul>
          <li>SMTP Host: ${process.env.SMTP_HOST}</li>
          <li>SMTP Port: ${process.env.SMTP_PORT}</li>
          <li>SMTP User: ${process.env.SMTP_USER}</li>
        </ul>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📊 Email details:');
    console.log('- Message ID:', info.messageId);
    console.log('- From:', process.env.SMTP_USER);
    console.log('- To:', process.env.SMTP_USER);
    
  } catch (error) {
    console.error('❌ Email configuration failed:');
    console.error(error);
    process.exit(1);
  }
}

testEmailConfiguration();