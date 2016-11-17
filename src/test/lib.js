const { requestDebugger, nockGenerator, generateNockInstance, generateMockModule } = require('../lib')
const assert = require('assert')

describe('lib/index.js', () => {
  describe('nockGenerator()', () => {
    it('should return a valid nock mock', () => {
      const mock = nockGenerator(200, 999)({ nockInstance: 'asdf', method: 'GET', path: '/yolo', statusCode: 200, responseBody: { y: true } })
      const expected = `
asdf
  .get("/yolo")
  .delay(200)
  .times(999)
  .reply(
    200,
    {"y":true}
  )
`
      assert.equal(mock, expected)
    })
    it('should include a second paramter in the method call in the returned mock', () => {
      const mock = nockGenerator(200, 999)({
        nockInstance: 'asdf',
        method: 'POST',
        path: '/yolo',
        statusCode: 200,
        responseBody: { y: true },
        responseHeaders: { someheader: 'asdf' },
        requestBody: '{ a: false }'
      })
      const expected = `
asdf
  .post("/yolo", { a: false })
  .delay(200)
  .times(999)
  .reply(
    200,
    {"y":true},
    {"someheader":"asdf"}
  )
`
      assert.equal(mock, expected)
    })
  })

  describe('generateNockInstance()', () => {
    it('should return a valid nock instance', () => {
      const res = generateNockInstance('a', 'b')
      const expected = 'const a = nock("b")'
      assert.equal(res, expected)
    })
  })

  describe('requestDebugger()', () => {
    it('should call write with the return value of generateNock', () => {
      const instance = requestDebugger({}, {}, () => 'testv', (x) => {
        assert.equal(x, 'testv')
      })
      instance('request', { debugId: 1, uri: 'http://zombo.com/asdf', method: 'GET' })
      instance('response', { debugId: 1, statusCode: 200 })
    })
    it('should call generateNock with the appropriate input', () => {
      const name = 'zombocom'
      const method = 'POST'
      const uri = 'http://zombo.com/yolo?a=b'
      const path = '/yolo?a=b'
      const status = 200
      const body = { yolo: 'b' }
      const reqBody = '{ trolo: true }'
      const headers = { someHeader: '' }
      const domains = {}
      const instance = requestDebugger({}, domains, ({
        nockInstance: rname,
        method: rmethod,
        path: rpath,
        statusCode: rstatus,
        responseBody: rbody,
        responseHeaders: rheaders,
        requestBody: rreqBody
      }) => {
        assert.equal(rname, name)
        assert.equal(rmethod, method)
        assert.equal(rpath, path)
        assert.equal(rstatus, status)
        assert.equal(rbody, body)
        assert.equal(rheaders, headers)
        assert.equal(rreqBody, reqBody)
        return ''
      }, () => {})
      instance('request', { debugId: 1, uri, method, body: reqBody })
      instance('response', { debugId: 1, statusCode: status, body, headers })
      assert.equal(domains[name], 'http://zombo.com')
    })
  })

  describe('generateMockModule()', () => {
    it('should generate valid nock instances', () => {
      const real = generateMockModule({ a: 'b', c: 'd' }, 'yolo')
      const expected = `const nock = require('nock')

const a = nock("b")
const c = nock("d")

yolo
`
      assert.equal(real, expected)
    })
  })
})
