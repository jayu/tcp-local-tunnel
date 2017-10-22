const {proxyServer} = require('../index.js')

proxyServer({
	//host: '192.168.1.6',
	proxyPort: 80,
	tunnelPort: 8010
})