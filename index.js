const url = require('url')
const fetch = require('node-fetch')
const qs = require('qs')

module.exports = async (req, res) => {
  const uri = url.parse(req.url)
  const query = qs.parse(uri.query)
  const token = process.env.ZEIT_API_TOKEN
  if (query.delete) {
    const response = await fetch(`https://api.zeit.co/v2/now/deployments/${query.delete}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    res.setHeader('Access-Control-Allow-Origin', '*')
    response.body.pipe(res)
  } else {
    const response = await fetch('https://api.zeit.co/v2/now/deployments', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    res.setHeader('Access-Control-Allow-Origin', '*')
    response.body.pipe(res)
  }
}
