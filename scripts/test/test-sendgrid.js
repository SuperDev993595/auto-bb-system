require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Test SendGrid configuration
async function testSendGrid() {
  console.log('🧪 Testing SendGrid Configuration...\n');
  
  // Check environment variables
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  
  console.log('📋 Environment Variables:');
  console.log(`- SENDGRID_API_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`- SENDGRID_FROM_EMAIL: ${fromEmail ? '✅ Set' : '❌ Missing'}`);
  
  if (!apiKey) {
    console.log('\n❌ SENDGRID_API_KEY is required. Please add it to your .env file.');
    console.log('   Get your API key from: https://app.sendgrid.com/settings/api_keys');
    return;
  }
  
  if (!fromEmail) {
    console.log('\n❌ SENDGRID_FROM_EMAIL is required. Please add it to your .env file.');
    console.log('   Use a verified sender email address.');
    return;
  }
  
  // Set API key
  sgMail.setApiKey(apiKey);
  
  // Test email
  const testEmail = {
    to: 'test@example.com', // Replace with your test email
    from: fromEmail,
    subject: 'SendGrid Test - Auto Repair Shop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Auto Repair Shop</h1>
          <p style="color: #666; margin: 10px 0 0 0;">SendGrid Integration Test</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">✅ SendGrid is Working!</h2>
          
          <p style="color: #555; line-height: 1.6;">
            This is a test email to verify that SendGrid is properly configured for your auto repair shop system.
          </p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">Configuration Details</h3>
            <p style="color: #555; margin: 5px 0;"><strong>API Key:</strong> ✅ Configured</p>
            <p style="color: #555; margin: 5px 0;"><strong>From Email:</strong> ${fromEmail}</p>
            <p style="color: #555; margin: 5px 0;"><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Your email service is now ready to send:
          </p>
          
          <ul style="color: #555; line-height: 1.6;">
            <li>Appointment confirmations</li>
            <li>Appointment reminders</li>
            <li>Invoice emails</li>
            <li>Payment reminders</li>
          </ul>
          
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
    console.log('\n📧 Sending test email...');
    const response = await sgMail.send(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${response[0].headers['x-message-id']}`);
    console.log(`📧 Status Code: ${response[0].statusCode}`);
    
    console.log('\n🎉 SendGrid integration is working perfectly!');
    console.log('   Your email service is ready to use.');
    
  } catch (error) {
    console.log('\n❌ Error sending test email:');
    console.log(error.message);
    
    if (error.response) {
      console.log('📋 Error Details:');
      console.log(error.response.body);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your SendGrid API key is correct');
    console.log('2. Make sure your sender email is verified in SendGrid');
    console.log('3. Check your SendGrid account status');
  }
}

// Run the test
testSendGrid().catch(console.error);

