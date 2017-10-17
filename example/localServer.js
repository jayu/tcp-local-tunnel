const http = require('http')
const net = require('net')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')

const { client } = require('../index.js')

const host = {
    proxy : "192.168.1.6",
    server : "localhost"
}

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded());
server.use('/piki.mp4', express.static('piki.mp4'))
server.get('/someurl', function(req, res, next){
  res.send("some url page") 
  
});
server.get('/pikii.mp4', (req, res) => {
    res.header('Content-Type', 'video/mp4')
    fs.createReadStream('piki.mp4').pipe(res)
})
server.get('/vp', (req, res) => {
    fs.createReadStream('vp.exe').pipe(res)
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
server.post('/', function(req, res, next){
  console.log(req.socket == res.socket)
  console.log(res.socket.write)
  //res.socket.write("POST / ")
  //console.log(req.socket.read())
  res.json({server : true}) 
});
server.listen(3000, host.server);

client({
    host : "192.168.1.6",
    port : 80
  },
  {
    host : 'localhost',
    port : 3000
  },
  "0123456789012345",
  40
)