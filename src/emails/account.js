const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendWelcomeEmail(email, name) {
  sgMail.send({
    to: email,
    from: 'chrisdavidmills@gmail.com',
    subject: 'Welcome to our task app',
    text: `Welcome to the app, ${name}. Don't hesitate to ask if you have any questions or suggestions.\n\nYour friends at Task Manager app`
  })

  console.log(`Welcome e-mail sent to ${name}`);
}

function sendGoodbyeEmail(email, name) {
  sgMail.send({
    to: email,
    from: 'chrisdavidmills@gmail.com',
    subject: 'We\'ll miss you',
    text: `Goodbye for now, ${name} — we are sad to see you go, but respect your decision. Please feel free to let us know why you cancelled, and if you have any feedback that could help make our service better.\n\nYour friends at Task Manager app`
  })

  console.log(`Goodbye e-mail sent to ${name}`);
}

// BASIC EMAIL SENDING PATTERN
// sgMail.send({
//   to: 'chrisdavidmills@gmail.com',
//   from: 'chrisdavidmills@gmail.com',
//   subject: 'Sendgrid test mail',
//   text: 'It looks like I was able to send a mail via sendgrid.\n\nChris'
// })
// .then(() => {
//   console.log('Email sent successfully');
// })
// .catch((e) => {
//   console.log(`Email sending failed: ${e}`)
// })

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}
