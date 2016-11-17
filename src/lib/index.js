const url = require('url')

type Cache = { [number]: { method: string, url: Object, requestBody: string } }
type RequestObj = {
  nockInstance: string,
  method: string,
  path: string,
  statusCode: number,
  responseBody: Object,
  responseHeaders?: { [string]: string },
  requestBody?: string
}

module.exports.requestDebugger = (
  cache: Cache,
  nockInstances: { [string]: string },
  generateNock: (request: RequestObj) => string,
  write: (mock: string) => void
) => (type: string, data: Object) => {
  if (type === 'request') {
    const { debugId, uri, method, body } = data
    cache[debugId] = { method, url: url.parse(uri), requestBody: body }
  } else if (type === 'response') {
    const { debugId, statusCode, body, headers } = data
    const { method, url, requestBody } = cache[debugId]
    const nockInstance = url.host.replace(/[^\w-_]/g, '')
    delete cache[debugId]
    nockInstances[nockInstance] = `${url.protocol}//${url.auth ? `${url.auth}@` : ''}${url.host}`
    write(generateNock({
      nockInstance,
      method,
      path: url.path,
      statusCode,
      responseBody: body,
      responseHeaders: headers,
      requestBody
    }))
  }
}

module.exports.nockGenerator =
  (delay: number, repeat: number) =>
    ({ nockInstance, method, path, statusCode, responseBody, responseHeaders, requestBody }: RequestObj) => `
${nockInstance}
  .${method.toLowerCase()}("${path}"${requestBody ? `, ${requestBody}` : ''})
  .delay(${delay})
  .times(${repeat})
  .reply(
    ${statusCode},
    ${JSON.stringify(responseBody)}${
      responseHeaders
        ? `,\n    ${JSON.stringify(responseHeaders)}`
        : ''
    }
  )
`

const generateNockInstance = module.exports.generateNockInstance =
  (name: string, url: string) => `const ${name} = nock("${url}")`

module.exports.generateMockModule = (nockInstances: { [string]: string }, mocks: string) => {
  const definitions =
    Object.keys(nockInstances)
      .map((k, i) => generateNockInstance(k, nockInstances[k]))
      .join('\n')
  return `const nock = require('nock')

${definitions}

${mocks}
`
}
