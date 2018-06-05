const net = require('net');

const pipeSockets = (client, tunnel) => {
  console.log('piping');
  client.pipe(tunnel).pipe(client);
};

const proxyServer = config => {
  let tunnels = [];
  const waitingClients = [];

  const deleteAfterTimeout = client => {
    setTimeout(() => {
      const i = waitingClients.indexOf(client);
      if (i >= 0) {
        waitingClients.splice(i, 1);
      }
      client.end();
    }, config.timeout || 5000);
  };

  // Tunnel
  net
    .createServer(tunnel => {
      console.log('has tunnel');
      tunnel.setKeepAlive(true, 2000);
      if (waitingClients.length) {
        pipeSockets(waitingClients.shift(), tunnel);
      } else {
        tunnel.on('data', data => {
          console.log('tunnel received data', data.toString().length);
        });
        tunnel.on('end', data => {
          console.log('tunnel end');
        });
        tunnel.on('error', err => {
          console.log(Date.now(), 'tunnel connection error', err);
        });
        tunnel.on('close', data => {
          console.log('tunnel close');
          console.log('pre filter', tunnels.length);
          tunnels = tunnels.filter(_tunnel => _tunnel != tunnel);
          console.log('post flter', tunnels.length);
        });

        tunnels.push(tunnel);
      }
    })
    .listen(config.tunnelPort);

  // Proxy
  net
    .createServer(client => {
      client.setKeepAlive(true);
      client.on('error', () => {
        console.log('temp error handling');
      });
      if (tunnels.length) {
        pipeSockets(client, tunnels.shift());
      } else {
        waitingClients.push(client);
      }
      deleteAfterTimeout(client);
    })
    .listen(config.proxyPort);
};

module.exports = proxyServer;
