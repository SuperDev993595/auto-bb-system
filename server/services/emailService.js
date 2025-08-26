const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    // Configure SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  SENDGRID_API_KEY not found in environment variables');
    }
    sgMail.setApiKey(apiKey);
    
    // Set default from email
    this.defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@bbauto.com';
  }

  async sendInvoiceEmail({ to, customerName, invoiceNumber, invoiceAmount, dueDate, pdfBuffer, fileName }) {
    const msg = {
      to: to,
      from: this.defaultFrom,
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
          content: pdfBuffer.toString('base64'),
          filename: fileName,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    try {
      const response = await sgMail.send(msg);
      console.log('Email sent successfully:', response[0].headers['x-message-id']);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPaymentReminder({ to, customerName, invoiceNumber, invoiceAmount, dueDate, daysOverdue }) {
    const msg = {
      to: to,
      from: this.defaultFrom,
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
      const response = await sgMail.send(msg);
      console.log('Payment reminder sent successfully:', response[0].headers['x-message-id']);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw new Error('Failed to send payment reminder');
    }
  }

  // Send appointment confirmation email
  async sendAppointmentConfirmation({ to, customerName, appointmentDate, appointmentTime, vehicleInfo, serviceName, estimatedDuration, html }) {
    const msg = {
      to: to,
      from: this.defaultFrom,
      subject: `Appointment Confirmation - ${appointmentDate} at ${appointmentTime}`,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Auto Repair Shop</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Professional Auto Repair Services</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Confirmation</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Dear ${customerName},
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Your appointment has been successfully scheduled. Please review the details below:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
              <p style="color: #555; margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Vehicle:</strong> ${vehicleInfo}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Estimated Duration:</strong> ${estimatedDuration} minutes</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">What to Expect</h3>
              <p style="color: #555; margin: 5px 0;">• Please arrive 10 minutes before your scheduled time</p>
              <p style="color: #555; margin: 5px 0;">• Bring your vehicle registration and insurance information</p>
              <p style="color: #555; margin: 5px 0;">• Our team will perform a thorough inspection</p>
              <p style="color: #555; margin: 5px 0;">• You'll receive a detailed estimate before any work begins</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              If you need to reschedule or have any questions, please contact us at least 24 hours in advance.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for choosing our services!
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
      const response = await sgMail.send(msg);
      console.log('Appointment confirmation sent successfully:', response[0].headers['x-message-id']);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      throw new Error('Failed to send appointment confirmation');
    }
  }

  // Send appointment reminder email
  async sendAppointmentReminder({ to, customerName, appointmentDate, appointmentTime, vehicleInfo, serviceName, reminderType, subject }) {
    const msg = {
      to: to,
      from: this.defaultFrom,
      subject: subject || `Appointment Reminder - ${appointmentDate} at ${appointmentTime}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff3cd; padding: 20px; text-align: center;">
            <h1 style="color: #856404; margin: 0;">Appointment Reminder</h1>
            <p style="color: #856404; margin: 10px 0 0 0;">Auto Repair Shop</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Appointment Reminder</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Dear ${customerName},
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              This is a friendly reminder about your upcoming appointment:
            </p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Appointment Details</h3>
              <p style="color: #555; margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Vehicle:</strong> ${vehicleInfo}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Reminder</h3>
              <p style="color: #555; margin: 5px 0;">• Please arrive 10 minutes before your scheduled time</p>
              <p style="color: #555; margin: 5px 0;">• Bring your vehicle registration and insurance information</p>
              <p style="color: #555; margin: 5px 0;">• If you need to reschedule, please call us as soon as possible</p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              We look forward to serving you!
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
      const response = await sgMail.send(msg);
      console.log('Appointment reminder sent successfully:', response[0].headers['x-message-id']);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw new Error('Failed to send appointment reminder');
    }
  }
}

module.exports = new EmailService();
