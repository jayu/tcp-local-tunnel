const { client } = require('../index.js');

client(
  {
    host: '127.0.0.1', //REMOTE
    port: 8010,
    // Uncomment below to enable transport encryption::
    // encKey: 'DwUuKDoFtHVWrWGfS4rz1pm7bOTZ988o',
    // encIv: '435435f432543532'
  },
  {
    host: '127.0.0.1', //LOCAL
    port: 1234
  }
);
