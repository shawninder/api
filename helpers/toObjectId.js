const Data = require('data')

module.exports = exports = (timestamp) => {
  if (typeof timestamp === 'string') {
    timestamp = new Date(timestamp)
  }
  const hexSeconds = Math.floor(timestamp / 1000).toString(16).padStart(8, '0')

  return new Data.ObjectId(hexSeconds + '0000000000000000')
}
