const { proxyServer } = require('../index.js');

/* internet server proxy configuration */

proxyServer({
  proxyPort: 9898,
  tunnelPort: 8010,
  // Uncomment below to enable transport encryption::
  //encKey: 'DwUuKDoFtHVWrWGfS4rz1pm7bOTZ988o',
  //encIv: '435435f432543532'
});
