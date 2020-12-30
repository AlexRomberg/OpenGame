// config
const port = 80;

// load requirements
const express = require('express');
const socket = require('socket.io');
const fs = require('fs');
const cm = require('./customModules/consoleModule');
const rand = require('./customModules/random');
const game = require('./customModules/game');
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
    let gameData = game.getRoomJson(gameCode);
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
    let gameCode = game.getCode(client);

    client.on('disconnect', () => {
        ConnectedUsers--;
        cm.log("cyan", "user disconnected (total: " + ConnectedUsers + ")");
    });

    client.on('newChatMsg', (msg) => {
        game.saveMessage(msg, gameCode);
        io.emit('newChatMsg', msg);
    });

    client.on('addItem', (id) => {
        let newItem = game.addItem(id, gameCode);
        io.emit('addItem', newItem);
    });

    client.on('moveItem', (options) => {
        game.moveItem(options, gameCode);
        io.emit('moveItem', options);
    });
});


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


cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");