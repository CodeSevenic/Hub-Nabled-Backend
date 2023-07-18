const sgMail = require('@sendgrid/mail');
const { welcomeHtml } = require('./emailTemplate');
const dotenv = require('dotenv');

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('SENDGRID_API_KEY: ', process.env.SENDGRID_API_KEY);

function sendEmail({ to, subject, templateId, dynamicTemplateData, text, html, attachments }) {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL, // Change to your verified sender
    subject,
    text,
    html,
    templateId,
    dynamicTemplateData,
    attachments,
  };

  sgMail
    .send(msg)
    .then(() => console.log('Email sent'))
    .catch((error) => console.error(error));
}

function sendWelcomeEmail(to) {
  sendEmail({
    to,
    subject: 'Welcome!',
    html: welcomeHtml,
  });
}

function sendErrorLogEmail(to, err) {
  sendEmail({
    to,
    subject: 'Error Log',
    templateId: 'your_error_template_id',
    dynamicTemplateData: {
      error: err.stack,
    },
  });
}

function sendMonthlyCheckupEmail(to) {
  sendEmail({
    to,
    subject: 'Monthly Checkup',
    templateId: 'your_monthly_checkup_template_id',
    dynamicTemplateData: {
      /* Your dynamic data for template */
    },
  });
}

module.exports = {
  sendWelcomeEmail,
  sendErrorLogEmail,
  sendMonthlyCheckupEmail,
};
