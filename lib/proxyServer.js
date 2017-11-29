const net = require('net')

const proxyServer = (config) => {

  let connections = []
  let waitingSockets = []

  const pipeSockets = (request, tunnel) => {
      console.log('piping')
      request.pipe(tunnel).pipe(request)
  }
  const deleteAfterTimeout = (socket) => {
	console.log('set clear timeout')  	
	console.log(waitingSockets.length)
setTimeout(() => {
		console.log('clear timeout')
  		const i = waitingSockets.indexOf(socket)
		console.log(waitingSockets.length)
		console.log(socket == waitingSockets[0])
  		if (i >= 0) {
			console.log(i)

  			const _socket = waitingSockets.splice(i,1)[0]
			console.log(socket == _socket)
  		}
		socket.end()
  	}, config.timeout || 5000)
  }
  const proxyGate = net.createServer((socket) => {
	console.log('has socket')
    socket.setKeepAlive(true, 2000)
    if (waitingSockets.length) {
      pipeSockets(waitingSockets.shift(), socket)
    }
    else {
      
      socket.on('data', (data) => {
          console.log("socket proxy received data", data.toString().length)
          //console.log(data.toString())
      })
      socket.on('end', (data) => {
          console.log('socket proxy end')
      })
      socket.on('error', err => {
          console.log(Date.now(), 'socket connection error', err)
      })
      socket.on('close', (data) => {
          console.log('socket proxy close')
          console.log('pre filter', connections.length)
          connections = connections.filter((connection) => {
              if (connection == socket) {
                  //console.log('detecting socket', connection == socket, connection != socket)
              }
              return connection != socket
          })
          console.log('post flter', connections.length)

      })

      connections.push(socket)
    }

  }).listen(config.tunnelPort)

  const proxy = net.createServer((socket) => {
    socket.setKeepAlive(true)
    socket.on('error', () => {
      console.log('temp error handling')
    })
    socket.on('drain', () => {
      console.log('socket free')
    })
    if (connections.length) {
      pipeSockets(socket, connections.shift())
    }
    else {
      waitingSockets.push(socket)
    }
      deleteAfterTimeout(socket)
  }).listen(config.proxyPort)
}

module.exports = proxyServer
