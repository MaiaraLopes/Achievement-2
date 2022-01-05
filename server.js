const http = require("http"),
  url = require("url"),
  fs = require("fs");

http
  .createServer(function (request, response) {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = "";

    if (q.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
    } else {
      filePath = "index.html";
    }

    fs.appendFile(
      "log.txt",
      "URL: " + addr + "\nTimestamp: " + new Date() + "\n\n",
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log");
        }
      }
    );

    fs.readFile(filePath, function (err, data) {
      if (err) {
        throw err;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    });
  })
  .listen(8080);

console.log("My server is running");
