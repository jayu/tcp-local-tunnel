# TCP-LOCAL-TUNNEL

Simple module that allows to expose server from local network to the Internet.
It works similarly to [localtunnel](https://github.com/localtunnel/localtunnel), but is more stable and simpler.

I'm not providing a service where you can acess your exposed local server, you will need to have some VPS or another machine connected to the internet with at least two open ports.

Module creates connection from your local server to your remote server via TCP and transmits data in both ways with established tunnel.

This is extremly usefull when you need to access an IoT device (Raspberry PI i.e) running in your home network. For example you can turn off light (that you forgot to turn off, or just to make sure) in home from your workplace or any other place on Earth.

I'm also working on NodeMCU implementation of client side module (ESP8266 devices)

Module supports:
  - http
  - websocket
  - large files transfer (i.e streaming video from your house, local cloud storage)
  - mayby other prodocols that uses TCP  

The stability mostly depends on your local internet connection quality.

There is one security issue. If somebody knows host and port of your remote server which local machine connects to, then he also can creates tunnel and redirect remote requests to his machine instead of yours. I'm working on solution...

## Basic-usage
  `npm install tcp-local-tunnel`

  Let's say your local server is listening on `3000`

  ### Code to run on local machine

  ```javascript
  const { client } = require('tcp-local-tunnel')
  client({
    host : "255.255.255.255", // remote server ip or domain
    port : 8010 // tunnel port
  },
  {
    host : 'localhost',
    port : 3000
  })

  ```
  ### Code to run on remote machine
  ```javascript
  const { proxyServer } = require('tcp-local-tunnel')

  proxyServer({
    proxyPort: 80, // remote port to access exposed local machine
    tunnelPort: 8010 // tunnel port
  })

  ```
  
## Run server and expose it immediatly (code in `./example`)
  ### Code to run on local machine

  ```javascript
  const fs = require('fs')
  const express = require('express')
  const bodyParser = require('body-parser')

  const { client } = require('../index.js')

  /* simple express server showcase */

  const serverPort = 3000

  const server = express();

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded());

  server.get('/someurl', function(req, res, next){
    res.send("some url page") 
    
  });
  server.get('/video.mp4', (req, res) => {
      res.header('Content-Type', 'video/mp4')
      fs.createReadStream('neverGonna.mp4').pipe(res)
  })
  server.get('/long.json', (req, res) => {
      const file = fs.readFileSync('long.json')
      res.header('Content-Length', Buffer.byteLength(file))
      console.log("contetn length", Buffer.byteLength(file))
      res.json(file)
  })
  server.get('/', function(req, res, next){
    res.send("Main page") 
  });

  server.listen(serverPort);

  /* tcp tunnel config */

  client({
      host : "255.255.255.255",
      port : 8010
    },
    {
      host : 'localhost',
      port : serverPort
    },
    40 // number of concurrent open tunnels
  )
  ```
  ### Code to run on remote machine
  ```javascript
  const {proxyServer} = require('../index.js')

  /* internet server proxy configuration */

  proxyServer({
    proxyPort: 80,
    tunnelPort: 8010
  })
  ```
## API
### Client (local side)

```javascript
const { client } = require('tcp-local-tunnel')

client({
  host : "255.255.255", // remote server host or domain
    port : 8010 // remote server tunnel port
}, {
  host : "localhost", // local server host or ip
    port : 3000 // local server port
},
10 // number of concurent open tunnels, default is 10
)
```
### ProxyServer (remote side)

```javascript
const { proxyServer } = require('tcp-local-tunnel')

proxyServer({
  proxyPort: 80, // remote port to access exposed local machine
    tunnelPort: 8010 // tunnel port
    timeout : 5000 // time after request is rejected when there are no tunnel connections
})
```

