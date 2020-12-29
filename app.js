// config
const port = 80;

// load requirements
const express = require('express');
const socket = require('socket.io');
const fs = require('fs');
const cm = require('./customModules/consoleModule');
const rand = require('./customModules/random');
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
    if ('game' in req.query) {
        startGame(req.query.game, res);
    } else {
        res.render('new', {
            file: 'new',
            title: 'Neuer Raum',
            presetList: ['UNO']
        });
    }
});

// active game
app.get('/[0-9]{5}', (req, res) => {
    let gameCode = req.url.slice(-5);
    let messages = getMessages(gameCode);
    res.render('game', {
        file: 'game',
        title: 'Gameboard',
        gameCode: req.baseUrl,
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
        saveMessage(msg, getGameCode(client));
        io.emit('newChatMsg', msg);
    });
});

function getGameCode(client) {
    return client.handshake.headers.referer.slice(-5);
}

function saveMessage(message, gameCode) {
    let filePath = 'data/chat/' + gameCode + '.txt';
    let messageText = "\n" + message;

    fs.appendFile(filePath, messageText, function(err) {
        if (err) throw err;
    });
}

function getMessages(gameCode) {
    try {
        let filePath = 'data/chat/' + gameCode + '.txt';
        return fs.readFileSync(filePath).toString().split('\n');
    } catch (err) {
        return [];
    }
}

function startGame(gameId, res) {
    try {
        if (Number(gameId) != NaN) {
            const presetfile = fs.readFileSync('data/presets.json', 'utf8');
            const gamelist = JSON.parse(presetfile);
            const presets = gamelist.presets;
            if (presets.length > gameId) {
                let gameCode = rand.getInt(10000, 100000);
                while (fs.existsSync('data/roomdata/' + gameCode + '.json')) {
                    gameCode = rand.getInt(10000, 100000);
                }
                console.log(presets[gameId]);
                copyGameinfo(gameCode, presets[gameId]);
                res.redirect('/' + gameCode);
                return;
            }
        }
    } catch (err) {
        console.log("Error writing file: " + err);
        cm.log('red', 'Error loading gamepresets');
    }
    res.redirect('/new');
}

function copyGameinfo(gameCode, options) {
    let fileDestinationPath = 'data/roomdata/' + gameCode + '.json';
    try {
        const data = JSON.stringify(options);
        fs.writeFileSync(fileDestinationPath, data, 'utf8');
    } catch (err) {
        console.log("Error writing file: " + err);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");