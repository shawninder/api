const toObjectId = require('./toObjectId')

module.exports = exports = (entry) => {
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
