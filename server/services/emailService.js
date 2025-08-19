const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });
  }

  async sendInvoiceEmail({ to, customerName, invoiceNumber, invoiceAmount, dueDate, pdfBuffer, fileName }) {
    const mailOptions = {
      from: process.env.SMTP_USER || 'your-email@gmail.com',
      to: to,
      subject: `Invoice #${invoiceNumber} from Auto Repair Shop`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Auto Repair Shop</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Professional Auto Repair Services</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Invoice #${invoiceNumber}</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Dear ${customerName},
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for choosing our auto repair services. Please find attached your invoice for the work completed on your vehicle.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Invoice Summary</h3>
              <p style="color: #555; margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Amount Due:</strong> $${invoiceAmount.toFixed(2)}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Please review the attached invoice for complete details of the services provided. If you have any questions about this invoice, please don't hesitate to contact us.
            </p>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Payment Options</h3>
              <p style="color: #555; margin: 5px 0;">• Cash</p>
              <p style="color: #555; margin: 5px 0;">• Check</p>
              <p style="color: #555; margin: 5px 0;">• Credit Card</p>
              <p style="color: #555; margin: 5px 0;">• Bank Transfer</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for your business!
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Best regards,<br>
              Auto Repair Shop Team
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">123 Main Street, City, State 12345</p>
            <p style="margin: 5px 0;">Phone: (555) 123-4567 | Email: info@autorepair.com</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPaymentReminder({ to, customerName, invoiceNumber, invoiceAmount, dueDate, daysOverdue }) {
    const mailOptions = {
      from: process.env.SMTP_USER || 'your-email@gmail.com',
      to: to,
      subject: `Payment Reminder - Invoice #${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff3cd; padding: 20px; text-align: center;">
            <h1 style="color: #856404; margin: 0;">Payment Reminder</h1>
            <p style="color: #856404; margin: 10px 0 0 0;">Auto Repair Shop</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Invoice #${invoiceNumber} - Payment Overdue</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Dear ${customerName},
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              This is a friendly reminder that payment for Invoice #${invoiceNumber} is now ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Payment Details</h3>
              <p style="color: #555; margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Amount Due:</strong> $${invoiceAmount.toFixed(2)}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Days Overdue:</strong> ${daysOverdue}</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Please arrange payment as soon as possible to avoid any additional late fees. If you have any questions or need to discuss payment arrangements, please contact us immediately.
            </p>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Payment Options</h3>
              <p style="color: #555; margin: 5px 0;">• Cash</p>
              <p style="color: #555; margin: 5px 0;">• Check</p>
              <p style="color: #555; margin: 5px 0;">• Credit Card</p>
              <p style="color: #555; margin: 5px 0;">• Bank Transfer</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for your prompt attention to this matter.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Best regards,<br>
              Auto Repair Shop Team
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">123 Main Street, City, State 12345</p>
            <p style="margin: 5px 0;">Phone: (555) 123-4567 | Email: info@autorepair.com</p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payment reminder sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw new Error('Failed to send payment reminder');
    }
  }
}

module.exports = new EmailService();
