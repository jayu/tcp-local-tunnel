const http = require('http')
const net = require('net')
let connections = []

const proxyGate = http.createServer((req, res) => {
  console.log('connection to proxy gate')
}).listen(8081);

proxyGate.on('connection', (socket) => {
    socket.setKeepAlive(true)
    console.log('has socket')
    socket.on('data', (data) => {
        console.log("socket proxy received data")
        console.log(data.toString().length)
    })
    socket.on('end', (data) => {
        console.log('socket proxy end')
    })
    socket.on('close', (data) => {
        console.log('socket proxy close')
        console.log('pre filter', connections.length)
        connections = connections.filter((connection) => {
            if (connection == socket) {
                console.log('detecting socket', connection == socket, connection != socket)
            }
            return connection != socket
        })
        console.log('post flter', connections.length)

    })

    connections.push(socket)
    
})

http.createServer((req, res) => {
  console.log('proxyfing request')
  //req.socket.pipe(process.stdout)
  const socket = connections.shift();
  socket.on('data', (data) => {
    console.log('tunnel data', data.toString().length)
  })
  const agent = new http.Agent()
  agent.socket = socket 
  agent.createConnection = (port, host, options) => {
    return socket

  }
  console.log(req.method)
  const client_req = http.request({
    path: req.url,
    agent: agent,
    //host : 'localhost',
    //port : 3000,
    method: req.method,
    headers: req.headers
  }, (response) => {
    console.log("got response from server")
    response.pipe(res)
  })
  client_req.on('data', (data) => {
    console.log('client_req data', data)
  })
  client_req.on('error', (err) => {
    console.log('client_req error', err)
  })
  req.pipe(client_req)

}).listen(8080);

http.createServer((req, res) => {
    res.write('WELCOME to Heroku on port ' + process.env.PORT )
    res.end()
}).listen(process.env.PORT || 5000);