const fetch = require('node-fetch')

// console.log('process.env.ZEIT_API_TOKEN', process.env.ZEIT_API_TOKEN)
const token = process.env.ZEIT_API_TOKEN

module.exports = async (req, res) => {
  const response = await fetch(`https://api.zeit.co/v2/now/deployments/${req.params.uid}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  res.setHeader('Access-Control-Allow-Origin', '*')
  response.body.pipe(res)
}
