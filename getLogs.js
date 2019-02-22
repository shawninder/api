const Data = require('data')
const { send, createError, sendError } = require('micro')

const toObjectId = (timestamp) => {
  if (typeof timestamp === 'string') {
    timestamp = new Date(timestamp)
  }
  const hexSeconds = Math.floor(timestamp / 1000).toString(16).padStart(8, '0')

  return new Data.ObjectId(hexSeconds + '0000000000000000')
}

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

const convertTimes = (entry) => {
  if (entry._id) {
    if (entry._id.$gte) {
      entry._id.$gte = toObjectId(entry._id.$gte)
    }
    if (entry._id.$lte) {
      entry._id.$lte = toObjectId(entry._id.$lte)
    }
  }
  return entry
}

module.exports = async (req, res) => {
  return new Promise((resolve, reject) => {
    res.on('error', (err) => {
      sendError(req, res, createError(500, 'Error sending results', err))
    })
    data.use(({ db }) => {
      const body = []
      try {
        let err
        let query = JSON.parse(req.query.q)
        if (query.$and) {
          query.$and = query.$and.map(convertTimes)
        } else {
          query = convertTimes(query)
        }
        const limit = req.query.l ? parseInt(req.query.l, 10) : 10
        db.collection('events').find(query).sort({ _id: -1 }).limit(limit)
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
              send(res, 200, JSON.stringify(body))
            }
          })
      } catch (ex) {
        sendError(req, res, createError(400, 'Error parsing query', ex))
      }
    })
  })
}
