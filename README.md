# Generate Nocks from Requests (sorry for the terribly uncreative name)

Automatically generate [*Nock*](https://www.npmjs.com/package/nock) mocks from requests made with [*Request*](https://www.npmjs.com/package/request).

## Usage

First, let's install it. Since you normally don't want GNFR (too lazy to type "Generate Nocks from Requests"[^1]) installed permanently, we'll install it like this:

```sh
npm i generate-nocks-from-requests
```

Now lets hook it up:

```js
/* ... code */
const request = require('request')
require('generate-nocks-from-requests')(request)
/* ... more code */
```

Now run you're thing and trigger the requests you want to mock. After you'll probably need to kill the process. Now there should be a `mock.js` file in the directory you ran the server from. It contains you're nock mocks 🎉.

## API

### default `(Request, Options) => Flush`

The `default` export is a function taking a `Request` object and `Options` as a parameter and returns the `Flush` function.

### Options `object`

The default arguments are as follows:

```
{
  repeat = 999,
  delay = 200,
  output = 'mocks.js',
  flushOnExit = true
}
```

* `repeat`: Controls the argument that is passed to *Nocks* `#times()`.
* `delay`: Controls the argument passed to *Nocks* `#delay()`.
* `output`: The file to save the mocks to.
* `flushOnExit`: Wether or not to flush when the process exits. (see `Flush`)

### Flush `() => void`

Writes all the buffered mocks to the file defined in `options.output`. The `Flush` function is called automatically when the process exits regularly, or it receives one of this signals `SIGTERM`, `SIGHUP`, 'SIGBREAK'. To disable this behaviour, set `flushOnExit: false`.

[^1]: Yes, I did not type it again, but just copy-pasted it over from the header.
