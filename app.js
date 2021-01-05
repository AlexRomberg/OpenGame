// config
let port = 80;

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
        title: 'OG | Home',
        userId: rand.getInt(1000000000, 9999999999)
    });
});

// newRoom
app.get('/new', (req, res) => {
    let cookies = parseCookies(req.headers.cookie);
    if (cookies.userId === undefined || cookies.userName === undefined) {
        res.redirect('/?new');
    } else {

        if ('game' in req.query) {
            startGame(req.query.game, res);
        } else {
            res.render('new', {
                file: 'new',
                title: 'Neuer Raum',
                presetList: ['UNO']
            });
        }
    }
});

// active game
app.get('/[0-9]{5}', (req, res) => {
    let gameCode = req.url.slice(-5);
    let cookies = parseCookies(req.headers.cookie);
    if (cookies.userId === undefined || cookies.userName === undefined) {
        res.redirect('/?' + gameCode);
    } else {
        let gameData = game.getRoomJson(gameCode);
        res.render('game', {
            file: 'game',
            title: 'Gameboard',
            gameCode,
            data: gameData,
            userId: cookies.userId
        });
    }
});

app.get('/[0-9]{5}/[0-9]+', (req, res) => {
    let gameCode = req.url.substr(1, 5);
    let imageId = req.url.substr(7).replace(/\?.*/, '');
    res.redirect('/res/gamedata/objectdata/' + loadImage(imageId, gameCode));
});

// 404
app.use((req, res) => {
    cm.log("red", "unknown request: " + req.path);
    res.redirect('/');
    cm.log("yellow", "redirected to /");
});

// handle client connections
io.on('connection', (client) => {
    let gameCode = game.getCode(client);
    let cookies = parseCookies(client.handshake.headers.cookie);
    game.addUser({ id: cookies.userId, name: cookies.userName }, gameCode);

    client.on('disconnect', () => {
        game.removeUser(cookies.userId, gameCode);
    });

    client.on('newChatMsg', (msg) => {
        game.saveMessage(msg, gameCode);
        io.emit('newChatMsg', msg);
    });

    client.on('addItem', (id) => {
        let newItem = game.addItemFromLibrary(id, gameCode);
        io.emit('addItem', newItem);
    });

    client.on('moveItem', (params) => {
        game.moveItem(params, gameCode);
        io.emit('moveItem', params);
    });

    client.on('removeItem', (id) => {
        game.removeItem(id, gameCode);
        io.emit('removeItem', id);
    });

    client.on('unlockItem', (id) => {
        game.setItemLocked(id, gameCode, false);
        io.emit('setItemLockstate', { id, locked: false });
    });

    client.on('lockItem', (id) => {
        game.setItemLocked(id, gameCode, true);
        io.emit('setItemLockstate', { id, locked: true })
    });

    client.on('rotateItem', (param) => {
        let rotation = game.rotateItem(param.id, gameCode, param.deg);
        io.emit('setItemRotation', { id: param.id, rotation })
    });

    client.on('flipItem', (id) => {
        game.flipItem(id, gameCode);
        io.emit("updateImage", id);
    });

    client.on('makePrivate', (params) => {
        let id = game.addObjectPrivate(params.id, gameCode, params.userId);
        game.removeItem(params.id, gameCode);
        io.emit("removeItem", params.id);
        client.emit("addPrivateItem", { item: game.getPrivateObject(id, gameCode, params.userId), id });
    });

    client.on('shuffleItem', (id) => {
        game.shuffleCardset(id, gameCode);
    });

    client.on('getPrivateCard', (params) => {
        let card = game.getCardFromSet(params.id, gameCode);
        let returnVal = game.getItemFromCardset(card.card, gameCode, params.userId);

        client.emit("addPrivateItem", { item: returnVal, id: returnVal.id });
    });

    client.on('getPublicCard', (id) => {
        let card = game.getCardFromSet(id, gameCode);
        let newItem = game.addItemFromCardset(card.card, gameCode);
        if (card.stacksize < 1) {
            game.removeItem(id);
            io.emit('removeItem', id);
        }
        io.emit('addItem', newItem);
    });

    client.on('rollDice', (id) => {

    });

    client.on('makePublic', (params) => {
        let item = game.addItemFromPrivate(params.id, gameCode, params.userId);
        io.emit('addItem', item);
        client.emit('deletePrivateItem', params.id);
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
                copyGameinfo(gameCode, convertPreset(presets[gameId]));
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

function parseCookies(cookies) {
    let cookieString = "{";
    cookies.split('; ').forEach(cookie => {
        let splitCookie = cookie.split('=');
        if (cookieString.length > 1) {
            cookieString += ",";
        }
        cookieString += "\"" + splitCookie[0] + "\":\"" + splitCookie[1] + "\"";
    });
    cookieString += "}";
    return JSON.parse(cookieString);
}

function loadImage(id, gameCode) {
    let roomData = game.getRoomJson(gameCode);
    if (roomData.gameboard[id].flipable) {
        if (roomData.gameboard[id].fliped) {
            return roomData.gameboard[id].cover;
        } else {
            return roomData.gameboard[id].image;
        }
    }
    return roomData.gameboard[id].image;
}

function convertPreset(preset) {
    let gameData = {};
    gameData.presetname = preset.name;
    gameData.library = preset.objects;
    gameData.gameboard = [];
    gameData.privateSpace = [];
    gameData.messages = [];
    return gameData;
}

game.writeUserJson({});

cm.log("green", "Server Running!");
cm.log("blue", "http://localhost:" + port + "\n-------------------------------------------");