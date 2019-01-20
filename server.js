var http = require('http');
var fs = require('fs');
var chat = require('./chat');

http
  .createServer(function(req, res) {
    switch (req.url) {
      case '/':
        sendFile('index.html', res);
        break;
      case '/subscribe':
        chat.subscribe(req, res);
        break;
      case '/publish':
        var body = '';
        req
          .on('readable', function() {
            body += req.read();
            if (body.length > 1e4) {
              res.statusCode = 413;
              res.end('Your message is too big for my little chat');
            }
          })
          .on('end', function() {
            try {
              body = JSON.parse(body.replace('null', ''));
            } catch (error) {
              res.statusCode = 400;
              res.end('Bad request');
              return;
            }
            chat.publish(body.message);
            res.end('ok');
          });

        break;
      default:
        res.statusCode = 404;
        res.end('Not found');
    }
  })
  .listen(3000);

function sendFile(fileName, res) {
  var fileStream = fs.createReadStream(fileName);
  fileStream
    .on('error', function() {
      res.statusCode = 500;
      res.end('Server error');
    })
    .pipe(res)
    .on('close', function() {
      fileStream.destroy();
    });
}
