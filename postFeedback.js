const { json, send } = require('micro')
const mailer = require('nodemailer')

// console.log('process.env.GMAIL_USER', process.env.GMAIL_USER)
// console.log('process.env.GMAIL_PASS', process.env.GMAIL_PASS)

const smtpTransport = mailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
})

module.exports = async (req, res) => {
  const data = await json(req)
  const mail = {
    from: data.email || process.env.GMAIL_ADDRESS,
    to: process.env.GMAIL_ADDRESS,
    subject: `FEEDBACK${data.email ? ` from: ${data.email}` : ''}`,
    text: `${data.body}`
  }
  smtpTransport.sendMail(mail, (err, response) => {
    if (err) {
      console.error('Error sending e-mail', err)
      send(res, 500, { err })
    } else {
      // console.log('E-mail sent', response.message)
      send(res, 202, { ok: true })
    }
    smtpTransport.close()
  })
}
