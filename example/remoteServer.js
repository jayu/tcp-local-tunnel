const { proxyServer } = require('../index.js');

/* internet server proxy configuration */

proxyServer({
  proxyPort: 80,
  tunnelPort: 8010
});
