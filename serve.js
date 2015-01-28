var http = require('http');
var svr = new http.Server(1080, http.fileHandler('./'));
console.log(require('os').networkInfo().en0[1].address)
svr.run();
