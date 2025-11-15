const nodemailer = require('nodemailer');

// Email configuration - using Gmail with app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'aarsene553@gmail.com',
    pass: process.env.EMAIL_PASSWORD || '' // Use app-specific password
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email service not fully configured. Contact form submissions will be logged instead.');
    console.log('To enable email: Set EMAIL_USER and EMAIL_PASSWORD in .env');
  } else {
    console.log('✅ Email service is ready');
  }
});

/**
 * Send contact form email
 */
async function sendContactEmail(formData) {
  try {
    const { name, email, subject, message } = formData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'aarsene553@gmail.com',
      to: 'aarsene553@gmail.com',
      replyTo: email,
      subject: `Art Revolution Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d4a574;">New Contact Form Submission</h2>
          <hr style="border: none; border-top: 1px solid #4a453d;">
          
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          
          <h3 style="color: #d4a574;">Message:</h3>
          <p style="white-space: pre-wrap; background: #f5f1eb; padding: 15px; border-radius: 5px; color: #1a1612;">
            ${message}
          </p>
          
          <hr style="border: none; border-top: 1px solid #4a453d;">
          <p style="font-size: 12px; color: #999;">
            This email was sent from the Art Revolution contact form.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Contact email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    // Log the submission even if email fails
    console.log('💾 Contact submission logged:', formData);
    return { success: false, error: error.message };
  }
}

/**
 * Send newsletter subscription confirmation
 */
async function sendNewsletterConfirmation(email, interests) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'aarsene553@gmail.com',
      to: email,
      subject: '✓ Welcome to Art Revolution Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d4a574;">Welcome to Art Revolution Newsletter! 🎨</h2>
          
          <p>Thank you for subscribing to our weekly cultural digest from Timișoara.</p>
          
          <h3 style="color: #d4a574;">Your Interests:</h3>
          <ul>
            ${interests.map(interest => `<li>${interest}</li>`).join('')}
          </ul>
          
          <p>You'll start receiving curated events and cultural updates tailored to your preferences.</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you did not subscribe to this newsletter, please reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Newsletter confirmation sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending newsletter confirmation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send partnership inquiry confirmation
 */
async function sendPartnershipEmail(formData) {
  try {
    const { org, contact, pemail, ptype, pmessage } = formData;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'aarsene553@gmail.com',
      to: 'aarsene553@gmail.com',
      replyTo: pemail,
      subject: `Art Revolution Partnership Inquiry: ${org}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d4a574;">New Partnership Inquiry</h2>
          <hr style="border: none; border-top: 1px solid #4a453d;">
          
          <p><strong>Organization:</strong> ${org}</p>
          <p><strong>Contact Person:</strong> ${contact}</p>
          <p><strong>Email:</strong> <a href="mailto:${pemail}">${pemail}</a></p>
          <p><strong>Partnership Type:</strong> ${ptype}</p>
          
          <h3 style="color: #d4a574;">Organization Details:</h3>
          <p style="white-space: pre-wrap; background: #f5f1eb; padding: 15px; border-radius: 5px; color: #1a1612;">
            ${pmessage || 'No additional information provided'}
          </p>
          
          <hr style="border: none; border-top: 1px solid #4a453d;">
          <p style="font-size: 12px; color: #999;">
            This email was sent from the Art Revolution partnership inquiry form.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Partnership email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending partnership email:', error);
    console.log('💾 Partnership submission logged:', formData);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendContactEmail,
  sendNewsletterConfirmation,
  sendPartnershipEmail
};
