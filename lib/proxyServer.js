const net = require('net')

const proxyServer = (config) => {

  let connections = []
  let waitingSockets = []

  const pipeSockets = (request, tunnel, data) => {
      request.on('error', (err) => {
        //console.log("proxy err", err)
      })
      request.on('close', () => {
        //console.log("proxy err", err)
        tunnel.end()
      })
      request.on('end', () => {
        //console.log("proxy err", err)
        tunnel.end()
      })
      request.resume()
      tunnel.resume()
      console.log('piping')
      //request.pipe(process.stdout)
      tunnel.pipe(request)
      tunnel.write(data)
  }
  const proxyGate = net.createServer((socket) => {
    socket.setKeepAlive(true)
    if (waitingSockets.length) {
      pipeSockets(waitingSockets.shift(), socket)
    }
    else {
      
      socket.on('data', (data) => {
          //console.log("socket proxy received data", data.toString().length)
          //console.log(data.toString())
      })
      socket.on('end', (data) => {
          //console.log('socket proxy end')
      })
      socket.on('error', err => {
          //console.log(Date.now(), 'socket connection error', err)
      })
      socket.on('close', (data) => {
          //console.log('socket proxy close')
          //console.log('pre filter', connections.length)
          connections = connections.filter((connection) => {
              if (connection == socket) {
                  //console.log('detecting socket', connection == socket, connection != socket)
              }
              return connection != socket
          })
          //console.log('post flter', connections.length)

      })

      connections.push(socket)
    }

  })//.listen(config.tunnelPort, config.host)

  const proxy = net.createServer((socket) => {
    socket.setKeepAlive(true)
    socket.on('error', () => {
      console.log('temp error handling')
    })
    socket.on('drain', () => {
      console.log('socket free')
    })
    socket.on('data', (data) => {
      socket.pause()
      //console.log(data.toString())
      if (data.length == 16 && data.toString() == config.code) {
        if (waitingSockets.length) {
          console.log('there are waitingSockets')
          const waiting = waitingSockets.shift()
          pipeSockets(waiting.socket, socket, waiting.data)
        }
        else {
          console.log('tunnel socket added to connections')
          socket.on('data', (data) => {
              //console.log("socket proxy received data", data.toString().length)
              //console.log(data.toString())
          })
          socket.on('end', (data) => {
              //console.log('socket proxy end')
          })
          socket.on('error', err => {
              //console.log(Date.now(), 'socket connection error', err)
          })
          socket.on('close', (data) => {
              //console.log('socket proxy close')
              //console.log('pre filter', connections.length)
              connections = connections.filter((connection) => {
                  if (connection == socket) {
                      //console.log('detecting socket', connection == socket, connection != socket)
                  }
                  return connection != socket
              })
              //console.log('post flter', connections.length)

          })

          connections.push(socket)
        }
      }
      else {
        console.log('request')
        if (connections.length) {
          console.log('pipe request to tunnel')
          pipeSockets(socket, connections.shift(), data)
        }
        else {
          console.log('not a free tunnel to pipe')
          waitingSockets.push({socket,data})
        }
      }
    })
    
    
  }).listen(config.proxyPort/*, config.host*/)
}

module.exports = proxyServer
