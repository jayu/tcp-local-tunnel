const http = require('http')
const net = require('net')
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
  40
)