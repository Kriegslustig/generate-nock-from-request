const { requestDebugger, nockGenerator, generateNockInstance } = require('../lib')
const assert = require('assert')

describe('lib/index.js', () => {
  describe('nockGenerator()', () => {
    it('should return a valid nock mock', () => {
      const mock = nockGenerator(200, 999)('asdf', 'GET', '/yolo', 200, { y: true })
      const expected = `
asdf
  .get("/yolo")
  .delay(200)
  .times(999)
  .reply(200, {"y":true})
`
      assert.equal(mock, expected)
    })
    it('should include a second paramter in the method call in the returned mock', () => {
      const mock = nockGenerator(200, 999)('asdf', 'POST', '/yolo', 200, { y: true }, { a: false })
      const expected = `
asdf
  .post("/yolo", {"a":false})
  .delay(200)
  .times(999)
  .reply(200, {"y":true})
`
      assert.equal(mock, expected)
    })
  })

  describe('generateNockInstance()', () => {
    it('should return a valid nock instance', () => {
      const res = generateNockInstance('a', 'b')
      const expected = '\nconst a = nock("b")\n'
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
      const domains = {}
      const instance = requestDebugger({}, domains, (rname, rmethod, rpath, rstatus, rbody) => {
        assert.equal(rname, name)
        assert.equal(rmethod, method)
        assert.equal(rpath, path)
        assert.equal(rstatus, status)
        assert.equal(rbody, body)
      }, () => {})
      instance('request', { debugId: 1, uri, method })
      instance('response', { debugId: 1, statusCode: status, body })
      assert.equal(domains[name], 'http://zombo.com')
    })
  })
})
