// config
const port = 80;

// load requirements
const express = require('express');
const socket = require('socket.io');
const fs = require('fs');
const cm = require('./customModules/consoleModule');
const { stringify } = require('querystring');
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
        file: 'index',
        title: 'OG | Home'
    });
});

// newRoom
app.get('/new', (req, res) => {
    res.render('new', {
        file: 'new',
        title: 'Neuer Raum'
    });
});

// active game
app.get('/[0-9]{5}', (req, res) => {
    let messages = getMessages();
    res.render('game', {
        file: 'game',
        title: 'Gameboard',
        roomId: req.baseUrl,
        messages
    });
});

// 404
app.use((req, res) => {
    cm.log("red", "unknown request: " + req.path);
    res.redirect('/');
    cm.log("yellow", "redirected to /");
});



// handle client connections
let ConnectedUsers = 0;

io.on('connection', (client) => {
    ConnectedUsers++;
    cm.log("cyan", "user connected (total: " + ConnectedUsers + ")");

    client.on('disconnect', () => {
        ConnectedUsers--;
        cm.log("cyan", "user disconnected (total: " + ConnectedUsers + ")");
    });

    client.on('newChatMsg', (msg) => {
        cm.log("cyan", "new chat message: " + msg);
        saveMessage(msg);
        io.emit('newChatMsg', msg);
    });
});

// message handeling
function saveMessage(text) {
    fs.appendFile('data/chatMessages.txt', "\n" + text, function(err) {
        if (err) throw err;
    });
}

function getMessages() {
    return fs.readFileSync('data/chatMessages.txt').toString().split('\n');
}

cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");