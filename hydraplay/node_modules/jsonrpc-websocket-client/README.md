# jsonrpc-websocket-client [![Build Status](https://travis-ci.org/jsonrpc-websocket-client.png?branch=master)](https://travis-ci.org/jsonrpc-websocket-client)

> JSON-RPC 2 over WebSocket

## Install

Installation of the [npm package](https://npmjs.org/package/jsonrpc-websocket-client):

```
> npm install --save jsonrpc-websocket-client
```

This library requires promises support, for Node versions prior to 0.12 [see
this page](https://github.com/JsCommunity/promise-toolbox#usage) to
enable them.

## Usage

```javascript
import Client from 'jsonrpc-websocket-client'

async function main () {
  const client = new Client('ws://example.org')

  console.log(client.status)
  // → closed

  await client.open()

  console.log(client.status)
  // → open

  console.log(
    await client.call('method', [1, 2, 3])
  )

  await client.close()
}

// Run the main function and prints any errors.
main().catch(error => {
  console.error(error)
  process.exit(1)
})
```

### Creation

```js
const client = new Client(opts)
```

`opts` is either a string (the URL of the server) or an object with
the following properties:

- `url`: URL of the JSON-RPC server
- `protocols` (*optional*): the WebSocket sub-protocols to use

### Connection management

**Status**

```js
console.log(client.status)
```

Possible values:

- `open`
- `connecting`
- `closed`

**Connection**

```js
await client.open()
```

**Disconnection**

```js
await client.close()
```

This method can also be used to abort the connection while connecting.

### Events

**Connection**

```js
client.on('open', () => {
  console.log('client is now open')
})
```

**Disconnection**

```js
client.on('closed', () => {
  console.log('client is now closed')
})
```

**Notification**

```js
client.on('notification', notification => {
  console.log('notification received', notification)
})
```

## Recipes

### Always stay connected

> Reconnect on disconnection:

```js
client.on('closed', () => {
  client.open()
})
```

> Use back off to keep retrying to connect:

```js
import { createBackoff } from 'jsonrpc-websocket-client'

client.open(createBackoff())
```

## Development

```
# Install dependencies
> yarn

# Run the tests
> yarn test

# Continuously compile
> yarn dev

# Continuously run the tests
> yarn dev-test

# Build for production (automatically called by npm install)
> yarn build
```

## Contributions

Contributions are *very* welcomed, either on the documentation or on
the code.

You may:

- report any [issue](https://github.com/JsCommunity/jsonrpc-websocket-client/issues)
  you've encountered;
- fork and create a pull request.

## License

ISC © [Julien Fontanet](https://julien.isonoe.net)
