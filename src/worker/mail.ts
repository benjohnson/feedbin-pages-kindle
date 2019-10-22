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
    to: email,
    subject: 'Your Feedbin Pages ebook is here!',
    text:
      'Your Feedbin Pages ebook is attached to this email. Forward it to your kindle email address, or send it directly. Thanks for using Feedbin-Pages-Kindle!',
    attachments: [
      {
        path: pathToFile,
      },
    ],
  });
};
