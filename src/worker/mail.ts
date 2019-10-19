import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default (email, pathToFile) => {
  return transporter.sendMail({
    from: 'postmaster@benjohnson.ca',
    to: 'ben@benjohnson.ca',
    attachments: [{
      path: pathToFile,
    }]
  });
};
