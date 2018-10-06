const fetch = require('node-fetch')
const qs = require('qs')

// console.log('process.env.YOUTUBE_KEY', process.env.YOUTUBE_KEY)
const youtubeKey = process.env.YOUTUBE_KEY

module.exports = async (req, res) => {
  const href = `https://www.googleapis.com/youtube/v3/search?${qs.stringify({
    maxResults: '25',
    part: 'snippet',
    q: req.query.q,
    pageToken: req.query.pageToken,
    type: '',
    key: youtubeKey,
    // Get only embeddable results
    format: 5
  })}`

  console.log('GET', href)
  try {
    const response = await fetch(href)
    const json = await response.json()
    return json
  } catch (ex) {
    const msg = 'getMedia failed'
    console.log(msg, ex)
    return msg
  }
}
