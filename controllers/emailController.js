const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key (this will be overridden by .env variable)
// Note: It's better to store this in an environment variable (.env file)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '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';
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send email with PDF attachment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendEmailWithPDF = async (req, res) => {
  try {
    const { 
      to, 
      from = 'registronotas2025@gmail.com', 
      subject, 
      text, 
      html, 
      pdfContent, 
      pdfName = 'evaluacion.pdf' 
    } = req.body;

    // Check for required fields
    if (!to || !subject || !pdfContent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, or pdfContent' 
      });
    }

    // Prepare the email message
    const msg = {
      to,
      from,
      subject,
      text: text || 'Adjunto encontrará el informe de evaluación.',
      html: html || '<p>Adjunto encontrará el informe de evaluación.</p>',
      attachments: [
        {
          content: pdfContent, // Base64 encoded content
          filename: pdfName,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Send the email
    await sgMail.send(msg);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};
