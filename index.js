const { createError, sendError } = require('micro')
const { router, get, post, del } = require('microrouter')
const microCors = require('micro-cors')
const btoa = require('btoa')
const postFeedback = require('./postFeedback')
const getDeployments = require('./getDeployments')
const deleteDeployment = require('./deleteDeployment')
const getMedia = require('./getMedia')
const getLogs = require('./getLogs')

const cors = microCors({ allowMethods: ['GET', 'PUT', 'POST', 'DELETE'] })

const adminUsername = process.env.ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD

// TODO Incorporate in a larger Authentication and Authorization scheme involving all users
const adminOnly = (wrapped) => {
  return (req, res) => {
    const auth = req.headers.authorization
    const token = btoa(`${adminUsername}:${adminPassword}`)
    if (auth === `Basic ${token}`) {
      return wrapped(req, res)
    } else {
      sendError(req, res, createError(403, 'Forbidden'))
    }
  }
}

const handler = router(
  post('/feedback', postFeedback),
  get('/deployments', getDeployments),
  del('/deployments/:uid', adminOnly(deleteDeployment)),
  get('/media', getMedia),
  get('/logs', getLogs)
)

module.exports = cors(handler)
