const Data = require('data')
const { send, createError, sendError } = require('micro')

let username
let password
let cluster
let hosts
let databaseName
let replicaSet

if (process.env.NODE_ENV === 'production') {
  username = process.env.ATLAS_HUB_USERNAME
  password = process.env.ATLAS_HUB_PASSWORD
  cluster = process.env.ATLAS_CLUSTER
  hosts = process.env.ATLAS_HOSTS
  databaseName = process.env.ATLAS_DATABASE
  replicaSet = process.env.ATLAS_REPLICA_SET
} else {
  username = process.env.MONGO_HUB_USERNAME
  password = process.env.MONGO_HUB_PASSWORD
  cluster = process.env.MONGO_CLUSTER
  hosts = process.env.MONGO_HOSTS
  databaseName = process.env.MONGO_DATABASE
  replicaSet = process.env.MONGO_REPLICA_SET
}
const data = new Data({
  username,
  password,
  cluster,
  hosts,
  databaseName,
  replicaSet
})

module.exports = async (req, res) => {
  return new Promise((resolve, reject) => {
    res.on('error', (err) => {
      sendError(req, res, createError(500, 'Error sending results', err))
    })
    data.use(({ db }) => {
      const body = []
      try {
        db.collection('events').find(JSON.parse(req.query.q)).sort({ _id: -1 }).limit(10)
          .on('error', (err) => {
            sendError(req, res, createError(500, 'Error getting results', err))
          })
          .on('data', (doc) => {
            body.push(doc)
          })
          .on('end', () => {
            send(res, 200, JSON.stringify(body))
          })
      } catch (ex) {
        sendError(req, res, createError(400, 'Error parsing query', ex))
      }
    })
  })
}
