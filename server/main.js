const WebSocket = require('ws');

'use strict';

  var fs = require('fs');
  var connections = 0;

    // you'll probably load configuration from config
  var cfg = {
    ssl: true,
    port: 8080,
    ssl_key: '/etc/letsencrypt/live/robertmorrison.me/privkey.pem',
    ssl_cert: '/etc/letsencrypt/live/robertmorrison.me/cert.pem'
  };

  var httpServ = (cfg.ssl) ? require('https') : require('http');
  var app = null;

    // dummy request processing
  var processRequest = function (req, res) {
    res.writeHead(200);
    res.end('All glory to WebSockets!\n');
  };

  if (cfg.ssl) {
    app = httpServ.createServer({
      // providing server with  SSL key/cert
      key: fs.readFileSync(cfg.ssl_key),
      cert: fs.readFileSync(cfg.ssl_cert)
    }, processRequest).listen(cfg.port);
  } else {
    app = httpServ.createServer(processRequest).listen(cfg.port);
  }

    // passing our reference to web server so WS knows port and SSL capabilities
	const wss = new WebSocket.Server({ server: app });

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', function connection(ws, req) {

  ws.id = ++connections;
  ws.ip = req.connection.remoteAddress;
  

  console.log("Client " + ws.id + " [" + ws.ip + "] connected.");

  var msg = {
    type: "echo",
    text: '',
    id:   '',
    date: Date.now()
  };
  
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    msg.type = "chatter";
    msg.text = message;
    msg.id = ws.id;
    msg.date = Date.now();
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });

  msg.type = "handshake";
  msg.text = "Welcome client " + ws.id + "!";
  ws.on('close', function close() {
	//connections--;
    console.log("Client "+ ws.id + " has disconnected.");
  });
  ws.send(JSON.stringify(msg));
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);

wss.on('close', function close() {
  console.log('disconnected');
});
