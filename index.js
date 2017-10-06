var StaticServer = require('static-server');
var server = new StaticServer({
  rootPath: '.',            // required, the root of the server file tree 
  name: 'pogi ako',   // optional, will set "X-Powered-by" HTTP header 
  port: 8181,               // optional, defaults to a random port 
  host: '0.0.0.0',       // optional, defaults to any interface 
  cors: '*'                 // optional, defaults to undefined 
});

server.start(function () {
  console.log('Server listening to', server.port);
});