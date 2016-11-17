const requestDebug = require('request-debug')
const { requestDebugger, nockGenerator, generateNockInstance, generateMockModule } = require('./lib')
const fs = require('fs')

type Options = {
  repeat: number,
  delay: number,
  output: string,
  flushOnExit: boolean
}

module.exports = function generateNocksFromRequests (
    request: Object,
    { repeat = 999, delay = 200, output = 'mocks.js', flushOnExit = true }: Options = {}
  ) {
  const cache = {}
  const nockInstances: { [string]: string } = {}
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
    fs.writeFileSync(output, generateMockModule(nockInstances, buffer))
  }

  if (flushOnExit) {
    process.on('exit', flush)
    process.on('SIGTERM', flush)
    process.on('SIGHUP', flush)
    process.on('SIGBREAK', flush)
  }

  return flush
}
