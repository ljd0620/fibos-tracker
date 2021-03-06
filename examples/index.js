// [clean env]
const fs = require("fs");
["", "\-shm", "\-wal"].forEach(function(k) {
	if (fs.exists("./fibos_chain.db" + k)) fs.unlink("./fibos_chain.db" + k);
});

// [fibos]
const fibos = require("fibos");
fibos.config_dir = "./data";
fibos.data_dir = "./data";
fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	"p2p-peer-address": ["p2p-testnet.fibos.fo:9870"],
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

fibos.load("producer");
fibos.load("chain", {
	"contracts-console": true,
	"delete-all-blocks": true,
	"genesis-json": "genesis.json"
});

fibos.load("chain_api");
fibos.load("emitter");

//[fibos-tracker]
const Tracker = require("../");
Tracker.Config.DBconnString = "mysql://root:123456@127.0.0.1/fibos_chain";
const tracker = new Tracker();

tracker.use(require("./addons/eosio_token_transfers.js"));

fibos.on('action', tracker.emitter((message, e) => {
	// fibos.stop();
}));

fibos.start();

// [http server]
const http = require("http");
let httpServer = new http.Server("", 8080, [
	(req) => {
		req.session = {};
	}, {
		'^/ping': (req) => {
			req.response.write("pong");
		},
		'/1.0/app': tracker.app,
		"*": [function(req) {}]
	},
	function(req) {}
]);

httpServer.crossDomain = true;
httpServer.asyncRun();