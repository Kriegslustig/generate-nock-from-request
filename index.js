const requestDebug = require('request-debug')
const { requestDebugger, nockGenerator, generateNockInstance } = require('./lib')
const fs = require('fs')

module.exports = function generateNocksFromRequests (
    request,
    { repeat = 999, delay = 200, output = 'mocks.js', flushOnExit = true } = {}
  ) {
  const cache = {}
  const nockInstances = {}
  let buffer = ''
  requestDebug(
    request,
    requestDebugger(
      cache,
      nockInstances,
      nockGenerator(delay, repeat),
      s => { buffer += s }
    )
  )
  const flush = () => {
    const definitions =
      Object.values(nockInstances)
        .map((k, i) => generateNockInstance(k, nockInstances[k]))
        .join('')
    fs.writeFileSync(output, `${definitions}\n${buffer}`)
  }

  if (flushOnExit) {
    process.on('exit', flush)
    process.on('SIGTERM', flush)
    process.on('SIGHUP', flush)
    process.on('SIGBREAK', flush)
  }

  return flush
}
