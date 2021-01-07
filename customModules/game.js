// imports
const fs = require('fs');
const cm = require('./consoleModule');
const rand = require('./random');

let ConnectedUsers = 0;

// chat
exports.saveMessage = function(message, gameCode) {
    let roomData = this.getRoomJson(gameCode);
    roomData.messages.push(message);
    this.writeRoomJson(roomData, gameCode);
    cm.log("cyan", "new chat message: " + message.text);
}

// users
exports.addUser = function(user, gameCode) {
    ConnectedUsers++;
    let userData = this.getUserJson();
    try {
        let userlist = userData[gameCode].users;
        userlist.push(user);
        let privatespace = this.getRoomJson(gameCode);
        if (!user.id in privatespace.privateSpace) {
            privatespace.privateSpace[user.id] = [];
        }
        this.writeRoomJson(gameCode, privatespace);
    } catch (e) {
        userData[gameCode] = [user];
    }
    this.writeUserJson(userData);
    cm.log("cyan", "user connected (total: " + ConnectedUsers + ")");
}

exports.removeUser = function(id, gameCode) {
    ConnectedUsers--;
    let userData = this.getUserJson();
    let index = userData[gameCode].findIndex(x => x.id === id);
    userData[gameCode].splice(index, 1);
    this.writeUserJson(userData);
    cm.log("cyan", "user disconnected (total: " + ConnectedUsers + ")");
}

// items
exports.addItemFromLibrary = function(id, gameCode) {
    let data = this.getRoomJson(gameCode);
    let item = clone(data.library[id]);
    let itemId = data.gameboard.length;
    item.x = 0;
    item.y = 0;
    item.rotation = 0;
    data.gameboard.push(item);
    this.writeRoomJson(data, gameCode);
    cm.log('green', "- added " + item.type + " to " + gameCode);
    return {
        type: item.type,
        name: item.name,
        image: item.image,
        id: itemId,
        flipable: item.flipable,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        locked: item.locked
    };
}

exports.addItemFromCardset = function(card, gameCode) {
    let data = this.getRoomJson(gameCode);
    let itemId = data.gameboard.length;
    card.x = 0;
    card.y = 0;
    card.rotation = 0;
    data.gameboard.push(card);
    this.writeRoomJson(data, gameCode);
    cm.log('green', "- added " + card.type + " to " + gameCode);
    return {
        type: card.type,
        name: card.name,
        image: card.image,
        id: itemId,
        flipable: card.flipable,
        x: card.x,
        y: card.y,
        rotation: card.rotation,
        locked: card.locked
    };
}

exports.getItemFromCardset = function(card, gameCode, userId) {
    let data = this.getRoomJson(gameCode);
    card.x = 0;
    card.y = 0;
    card.rotation = 0;
    let itemId;
    try {
        itemId = data.privateSpace[userId].length;
        data.privateSpace[userId].push(card);
    } catch (e) {
        let obj = {};
        obj[userId] = [card];
        itemId = 0;
        data.privateSpace = obj;
    }
    this.writeRoomJson(data, gameCode);
    return {
        type: card.type,
        name: card.name,
        image: card.image,
        flipable: card.flipable,
        id: itemId,
        x: card.x,
        y: card.y,
        rotation: card.rotation,
        locked: card.locked
    };
}

exports.addItemFromPrivate = function(id, gameCode, userId) {
    let data = this.getRoomJson(gameCode);
    let privateItem = data.privateSpace[userId][id];
    let itemId = data.gameboard.length;
    privateItem.x = 0;
    privateItem.y = 0;
    privateItem.rotation = 0;
    data.gameboard.push(privateItem);
    let item = clone(privateItem);
    data.privateSpace[userId][id] = null;
    this.writeRoomJson(data, gameCode);
    cm.log('green', "- added " + item.type + " to " + gameCode);
    return {
        type: item.type,
        name: item.name,
        image: item.image,
        id: itemId,
        flipable: item.flipable,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        locked: item.locked
    };
}

exports.moveItem = function(options, gameCode) {
    let data = this.getRoomJson(gameCode);
    if (!this.isLocked(options.id, gameCode)) {
        data.gameboard[options.id].x = options.x;
        data.gameboard[options.id].y = options.y;
    }
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- moved item " + options.id + " on " + gameCode);
    return options;
}

exports.removeItem = function(id, gameCode) {
    let data = this.getRoomJson(gameCode);
    data.gameboard[id] = null;
    this.writeRoomJson(data, gameCode);
    cm.log('red', "- removed item on " + gameCode);
}

// lockstate
exports.setItemLocked = function(id, gameCode, locked) {
    let data = this.getRoomJson(gameCode);
    data.gameboard[id].locked = locked;
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- set lockstate " + locked + " on " + gameCode);
}

exports.isLocked = function(id, gameCode) {
    let data = this.getRoomJson(gameCode);
    return data.gameboard[id].locked;
}

// rotation
exports.rotateItem = function(id, gameCode, deg) {
    let data = this.getRoomJson(gameCode);
    data.gameboard[id].rotation += deg;
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- rotated item " + deg + "deg to " + data.gameboard[id].rotation + "deg on " + gameCode);
    return data.gameboard[id].rotation;
}

// flip
exports.flipItem = function(id, gameCode, deg) {
    let data = this.getRoomJson(gameCode);
    if (this.isFlippable(id, gameCode)) {
        data.gameboard[id].fliped = !data.gameboard[id].fliped;
    }
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- fliped item on " + gameCode);
    return data.gameboard[id].fliped;
}

exports.isFlippable = function(id, gameCode) {
    let data = this.getRoomJson(gameCode);
    return data.gameboard[id].flipable;
}

// Private handeling
exports.addObjectPrivate = function(id, gameCode, userId) {
    let data = this.getRoomJson(gameCode);
    let itemId;
    try {
        itemId = privateSpace.length
    } catch (e) {
        itemId = 0;
        data.privateSpace[userId] = [];
    }
    data.privateSpace[userId].push(data.gameboard[id]);
    this.writeRoomJson(data, gameCode);
    return itemId;
}

exports.getPrivateObject = function(id, gameCode, userId) {
    let data = this.getRoomJson(gameCode);
    return data.privateSpace[userId][id];
}

// shuffle
exports.shuffleCardset = function(id, gameCode) {
    let data = this.getRoomJson(gameCode);
    let cards = data.gameboard[id].cards;
    data.gameboard[id].cards = shuffle(cards);
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- shuffled cardset on " + gameCode);
}

// cardset
exports.getCardFromSet = function(id, gameCode) {
    let data = this.getRoomJson(gameCode);
    let cards = data.gameboard[id].cards;
    let card = cards.pop();
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- pulled card from stack on " + gameCode);
    return { card, stacksize: cards.length };
}


// JSON handeling
exports.getRoomJson = function(gameCode) {
    try {
        let filePath = 'data/roomdata/' + gameCode + '.json';
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let roomData = JSON.parse(fileContent);
        return roomData;
    } catch (err) {
        cm.log("red", "Requested roomfile not found: " + gameCode + ": " + err);
    }
}

exports.writeRoomJson = function(roomData, gameCode) {
    try {
        let filePath = 'data/roomdata/' + gameCode + '.json';
        let data = JSON.stringify(roomData, null, 4);
        fs.writeFileSync(filePath, data, 'utf8');
    } catch (err) {
        cm.log("red", "Error writing Roomfile: " + gameCode + "\n (" + err + ")");
    }
}

exports.getUserJson = function() {
    try {
        let filePath = 'data/users.json';
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let roomData = JSON.parse(fileContent);
        return roomData;
    } catch (err) {
        cm.log("red", "Requested userfile not found: \n(" + err + ")");
    }
}

exports.writeUserJson = function(roomData) {
    try {
        let filePath = 'data/users.json';
        let data = JSON.stringify(roomData, null, 4);
        fs.writeFileSync(filePath, data, 'utf8');
    } catch (err) {
        cm.log("red", "Error writing userfile: \n (" + err + ")");
    }
}

// other
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

exports.getCode = function(client) {
    return client.handshake.headers.referer.slice(-5);
}

function shuffle(array) {
    var copy = [];
    var n = array.length;
    var i;
    while (n) {
        i = Math.floor(Math.random() * n--);
        copy.push(array.splice(i, 1)[0]);
    }

    return copy;
}


exports.startGame = function(gameId, res) {
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

exports.copyGameinfo = function(gameCode, options) {
    let fileDestinationPath = 'data/roomdata/' + gameCode + '.json';
    try {
        const data = JSON.stringify(options);
        fs.writeFileSync(fileDestinationPath, data, 'utf8');
    } catch (err) {
        cm.log("red", "Error creating gameinfo file: " + err);
    }
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