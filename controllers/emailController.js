const sgMail = require('@sendgrid/mail');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
      from, 
      subject, 
      text, 
      html, 
      htmlContent, 
      pdfContent,
      pdfName = 'evaluacion.pdf' 
    } = req.body;
    
    
    const verifiedSender = 'registronotas2025@gmail.com';

    if (!to || !subject || (!htmlContent && !pdfContent)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Campos requeridos faltantes (htmlContent or pdfContent)' 
      });
    }

    let pdfBase64;
    
    if (htmlContent && !pdfContent) {
      try {
        const tempDir = path.join(os.tmpdir(), 'notas-registro-pdfs');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempPdfPath = path.join(tempDir, `${Date.now()}.pdf`);

        const browser = await puppeteer.launch({
          headless: 'new', 
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        await page.pdf({ 
          path: tempPdfPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          }
        });
        await browser.close();

        pdfBase64 = fs.readFileSync(tempPdfPath, { encoding: 'base64' });

        fs.unlinkSync(tempPdfPath);
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError);
        return res.status(500).json({
          success: false, 
          message: 'Error al generar PDF', 
          error: pdfError.message
        });
      }
    } else {
      pdfBase64 = pdfContent;
    }

    const msg = {
      to,
      from: verifiedSender, 
      subject,
      text: text || 'Adjunto encontrará el informe de evaluación.',
      html: html || '<p>Adjunto encontrará el informe de evaluación.</p>',
      attachments: [
        {
          content: pdfBase64, 
          filename: pdfName,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);

    return res.status(200).json({
      success: true,
      message: 'Email enviado con éxito',
    });
  } catch (error) {
    console.error('Error enviando correo:', error);
    
    let errorDetails = error.message;
    
    if (error.response && error.response.body && error.response.body.errors) {
      errorDetails = JSON.stringify(error.response.body.errors);
      console.error('SendGrid error detalles:', errorDetails);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error enviando correo',
      error: errorDetails
    });
  }
}
