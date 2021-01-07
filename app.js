// config
let port = 80;

// imports
const cm = require('./customModules/consoleModule');
const server = require('./customModules/server');
const io = require('./customModules/ioHandeling');
const game = require('./customModules/game');
console.clear()
cm.log("white", "starting...");


// handle process arguments
if (process.argv.length > 2) {
    port = process.argv[2];
}

let serverObject = server.init(port);
io.init(serverObject);

game.writeUserJson({});

cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");