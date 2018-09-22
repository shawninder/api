const url = require('url')
const { json, send } = require('micro')
const fetch = require('node-fetch')
const qs = require('qs')
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
  const uri = url.parse(req.url)
  // console.log('uri', uri)
  const query = qs.parse(uri.query)
  const token = process.env.ZEIT_API_TOKEN
  if (uri.pathname === '/feedback' && req.method === 'POST') {
    // console.log('POST')
    const data = await json(req)
    // console.log('data', data)
    const mail = {
      from: data.email || process.env.GMAIL_ADDRESS,
      to: process.env.GMAIL_ADDRESS,
      subject: `FEEDBACK - ${data.type}`,
      text: `from: ${data.email}\n${data.body}`
    }
    smtpTransport.sendMail(mail, (err, response) => {
      if (err) {
        console.error('Error sending e-mail', err)
        send(res, 500, { err })
      } else {
        // console.log('E-mail sent', response.message)
        res.end('ok')
      }
      smtpTransport.close()
    })
  } else if (query.delete) {
    const response = await fetch(`https://api.zeit.co/v2/now/deployments/${query.delete}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    res.setHeader('Access-Control-Allow-Origin', '*')
    response.body.pipe(res)
  } else if (query.q) {
    const href = `https://www.googleapis.com/youtube/v3/search?${qs.stringify({
      maxResults: '25',
      part: 'snippet',
      q: query.q,
      pageToken: query.pageToken,
      type: '',
      key: process.env.YOUTUBE_KEY,
      // Get only embeddable results
      format: 5
    })}`
    // console.log('href', href)
    const data = await fetch(href)
    // TODO use a specific origin here instead
    res.setHeader('Access-Control-Allow-Origin', '*')
    data.body.pipe(res)
  } else if (uri.pathname === '/deployments' && req.method === 'GET') {
    const response = await fetch('https://api.zeit.co/v2/now/deployments', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    res.setHeader('Access-Control-Allow-Origin', '*')
    response.body.pipe(res)
  } else {
    res.statusCode = 400
    res.end()
  }
}
