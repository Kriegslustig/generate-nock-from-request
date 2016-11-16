const url = require('url')

module.exports.requestDebugger = (cache, nockInstances, generateNock, write) => (type, data) => {
  if (type === 'request') {
    const { debugId, uri, method } = data
    cache[debugId] = { method, url: url.parse(uri) }
  } else if (type === 'response') {
    const { debugId, statusCode } = data
    const { method, url } = cache[debugId]
    const nockInstanceName = url.host.replace(/[^\w-_]/g, '')

    delete cache[debugId]
    nockInstances[nockInstanceName] = `${url.protocol}//${url.auth ? `${url.auth}@` : ''}${url.host}`
    write(generateNock(nockInstanceName, method, url.path, statusCode, data.body))
  }
}

// TODO implement automatic nock instance generation
module.exports.nockGenerator = (delay, repeat) => (nockInstance, method, path, statusCode, responseBody, requestBody) => `
${nockInstance}
  .${method.toLowerCase()}("${path}"${requestBody ? ', ' + JSON.stringify(requestBody) : ''})
  .delay(${delay})
  .times(${repeat})
  .reply(${statusCode}, ${JSON.stringify(responseBody)})
`

module.exports.generateNockInstance = (name, url) => `
const ${name} = nock("${url}")
`
