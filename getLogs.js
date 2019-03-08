const mongoQuery = require('./helpers/mongoQuery')
const convertTimes = require('./helpers/convertTimes')

const queryFn = (db, query) => {
  if (query.$and) {
    query.$and = query.$and.map(convertTimes)
  } else {
    query = convertTimes(query)
  }
  return db.collection('events').find(query).sort({ _id: -1 })
}

module.exports = mongoQuery({
  queryFn,
  defaultLimit: 10
})
