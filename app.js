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
    let gameData = getRoomJson(gameCode);
    res.render('game', {
        file: 'game',
        title: 'Gameboard',
        gameCode: req.baseUrl,
        data: gameData
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

    client.on('addItem', (id) => {
        let gameCode = getGameCode(client);
        let newItem = addItem(id, gameCode);
        cm.log('green', "- added " + newItem.type + " to " + gameCode);
        io.emit('addItem', newItem);
    });

    client.on('moveItem', (options) => {
        let gameCode = getGameCode(client);
        moveItem(options, gameCode);
        cm.log('yellow', "- moved item " + options.id + " on " + gameCode);
        io.emit('moveItem', options);
    });
});

function getGameCode(client) {
    return client.handshake.headers.referer.slice(-5);
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
                copyGameinfo(gameCode, presets[gameId]);
                res.redirect('/' + gameCode);
                return;
            }
        }
    } catch (err) {
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
        cm.log("red", "Error creating gameinfo file: " + err);
    }
}

function getRoomJson(gameCode) {
    let filePath = 'data/roomdata/' + gameCode + '.json';
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let roomData = JSON.parse(fileContent);
        return roomData;
    } catch (err) {
        cm.log("red", "Requested roomfile not found: " + gameCode + ": " + err);
    }
}

function writeRoomJson(roomData, gameCode) {
    try {
        let filePath = 'data/roomdata/' + gameCode + '.json';
        let data = JSON.stringify(roomData, null, 4);
        fs.writeFileSync(filePath, data, 'utf8');
    } catch (err) {
        cm.log("red", "Error writing Roomfile: " + gameCode + "\n (" + err + ")");
    }
}

// class game possible
function saveMessage(message, gameCode) {
    let roomData = getRoomJson(gameCode);
    roomData.messages.push(message);
    writeRoomJson(roomData, gameCode);
}

function addItem(id, gameCode) {
    let data = getRoomJson(gameCode);
    let item = clone(data.library[id]);
    let itemId = data.gameboard.length;
    item.x = 0;
    item.y = 0;
    data.gameboard.push(item);
    writeRoomJson(data, gameCode);
    return { type: item.type, name: item.name, image: item.image, id: itemId, flipable: item.flipable, x: item.x, y: item.y };
}

function moveItem(options, gameCode) {
    let data = getRoomJson(gameCode);
    data.gameboard[options.id].x = options.x;
    data.gameboard[options.id].y = options.y;
    writeRoomJson(data, gameCode);
    return options;
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}


cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");