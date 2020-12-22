// config
const port = 80;

// load requirements
const express = require('express');
const socket = require('socket.io');
const cm = require('./customModules/consoleModule');
console.clear()
cm.log("white", "starting...");


// handle process arguments
if (process.argv.length > 2) {
    port = process.argv[2];
}


// init modules
var app = express();
var server = app.listen(port);
var io = socket(server);
cm.log("green", "modules initialized!");

// app settings
app.set('view engine', 'ejs')
app.use(express.static('public')); // static files

// handle requests
app.get('/', (req, res) => {
    res.render('index', {
        title: 'index'
    });
});

app.get('/[0-9]{5}', (req, res) => {
    res.render('game', {
        title: 'Gameboard',
        roomId: req.baseUrl
    });
});

// 404
app.use((req, res) => {
    cm.log("red", "unknown request: " + req.path);
    res.redirect('/');
    cm.log("yellow", "redirected to /");
});

// handle client connections
io.on('connection', (client) => {
    console.log('a user connected');
    client.broadcast.emit('hi');


    client.on('disconnect', () => {
        console.log('user disconnected');
    });

    client.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");