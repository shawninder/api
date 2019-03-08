const mongoQuery = require('./helpers/mongoQuery')
const convertTimes = require('./helpers/convertTimes')

const queryFn = (db, pipeline) => {
  const query = pipeline.map((step) => {
    if (step.$match) {
      if (step.$match.$and) {
        step.$match.$and = step.$match.$and.map(convertTimes)
      } else {
        step.$match = convertTimes(step.$match)
      }
    }
    return step
  })

  return db.collection('events').aggregate(query)
}

module.exports = mongoQuery({
  queryFn,
  defaultLimit: 10
})
