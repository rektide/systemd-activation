var net = require('net');

var Server = net.Server.prototype;
var Pipe = process.binding('pipe_wrap').Pipe;

var numSystemdActivatedSockets= process.env.LISTEN_FDS,
  sockets= []
if(isNaN(numSystemdActivatedSockets))
	numSystemdActivatedSockets = -1
else
	--numSystemdActivatedSockets

module.exports.socket= socket
module.exports.activatedSocket= socket
module.exports.sockets= numSystemdActivatedSockets
module.exports.createHttpServers= lateBoundCreateServers.bind({server:'http'})
module.exports.createHttpsServers= lateBoundCreateServers.bind({server:'https'})

function lateBoundCreateServers(requestListener,listeningsCallback){
	var r= require(this.server),
	  servers= []
	for(var i= 0; i < numSystemdActivatedSockets; ++i){
		var server= r.createServer.apply(r,arguments),
		  serverSocket= socket(i)
		servers.push(server)
		process.nextTick(function(){
			server.listen(serverSocket,listeningsCallback)
		})
	}
	return servers
}

function socket(i){
	if(i > numSystemdActivatedSockets)
		throw('No or too many file descriptors received.')

	var p= sockets[i]
	if(p)
		return p
	p= sockets[i]= new Pipe()
	p.open(i+3)
	return p
}

var oldListen = Server.listen;
Server.listen = function () {
    var self = this;

    if (arguments.length == 1 && arguments[0] == 'systemd') {
        if (!process.env.LISTEN_FDS || process.env.LISTEN_FDS != 1) {
            throw('No or too many file descriptors received.');
        }

        self._handle = socket(0)
        self._listen2(null, -1, -1);
    } else {
        oldListen.apply(self, arguments);
    }
}
