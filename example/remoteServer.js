const {proxyServer} = require('../index.js')

proxyServer({
	host: '192.168.1.6',
	proxyPort: process.env.PORT || 80,
	tunnelPort: 8010,
	code : "0123456789012345"
})