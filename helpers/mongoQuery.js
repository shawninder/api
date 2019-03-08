const Data = require('data')
const { send, createError, sendError } = require('micro')

const mongoConfig = require('./mongoConfig')

const data = new Data(mongoConfig)

const noop = (thing) => thing

module.exports = exports = (opts) => {
  const queryFn = opts.queryFn || noop
  const defaultLimit = opts.defaultLimit || 1000
  return async (req, res) => {
    return new Promise((resolve, reject) => {
      res.on('error', (err) => {
        sendError(req, res, createError(500, 'Error sending results', err))
      })
      data.use(({ db }) => {
        const body = []
        try {
          let err
          const limit = req.query.l ? parseInt(req.query.l, 10) : defaultLimit
          queryFn(db, JSON.parse(req.query.q))
            .limit(limit)
            .on('error', (err) => {
              err = createError(500, 'Error getting results', err)
            })
            .on('data', (doc) => {
              body.push(doc)
            })
            .on('end', () => {
              if (err) {
                sendError(req, res, createError(500, 'Error getting results', err))
              } else {
                console.log('==== RESPONSE BODY', body)
                send(res, 200, JSON.stringify(body))
              }
            })
        } catch (ex) {
          sendError(req, res, createError(400, 'Error parsing query', ex))
        }
      })
    })
  }
}
