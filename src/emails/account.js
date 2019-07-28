const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'kevin.gaotao@gmail.com',
    subject: "Thanks for joining in TAO's Task Manager App",
    text: `Welcome to the app, ${name}. Let me how you get along with the app.`
  })
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to:email,
    from: 'kevin.gaotao@gmail.com',
    subject: 'Sorry to see go',
    text: `Goodby ${name}. I hope to see you back sometime soon.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
}