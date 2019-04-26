const https = require('https')
const fetch = require('node-fetch')
const qs = require('qs')

// console.log('process.env.YOUTUBE_KEY', process.env.YOUTUBE_KEY)
const youtubeKey = process.env.YOUTUBE_KEY
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET

const findOnYouTube = async (req) => {
  const searchYoutube = `https://www.googleapis.com/youtube/v3/search?${qs.stringify({
    maxResults: '25',
    part: 'snippet',
    q: req.query.q,
    pageToken: req.query.pageToken,
    type: '',
    key: youtubeKey,
    // Get only embeddable results
    format: 5
  })}`
  const response = await fetch(searchYoutube)
  return response.json()
}

const getSpotifyToken = () => {
  return new Promise((resolve, reject) => {
    const auth = `Basic ${Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64')}`

    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    const tokenRequest = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        resolve(JSON.parse(body).access_token)
      })
    })

    tokenRequest.write('grant_type=client_credentials')
    tokenRequest.end()
  })
}

const searchSpotify = (req, token) => {
  return new Promise((resolve, reject) => {
    const auth = `Bearer ${token}`
    const options = {
      hostname: 'api.spotify.com',
      path: `/v1/search?${qs.stringify({
        q: req.query.q,
        type: 'track'
      })}`,
      headers: {
        'Authorization': auth,
        'Accept': 'application/json'
      }
    }
    const searchRequest = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        resolve(JSON.parse(body).tracks.items)
      })
    })
    searchRequest.end()
  })
}

const findOnSpotify = async (req) => {
  const token = await getSpotifyToken()
  return searchSpotify(req, token)
}

module.exports = async (req, res) => {
  try {
    const responses = await Promise.all([findOnYouTube(req)])
    return responses[0]
  } catch (ex) {
    const msg = 'getMedia failed'
    console.log(msg, ex.message)
    return msg
  }
}
