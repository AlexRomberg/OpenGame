const cm = require('./consoleModule');
const fs = require('fs');

let ConnectedUsers = 0;

exports.saveMessage = function (message, gameCode) {
    let roomData = this.getRoomJson(gameCode);
    roomData.messages.push(message);
    this.writeRoomJson(roomData, gameCode);
    cm.log("cyan", "new chat message: " + message);
}

exports.addUser = function (user, gameCode) {
    ConnectedUsers++;
    let userData = this.getUserJson();
    try {
        let userlist = userData[gameCode].users;
        userlist.push(user);
    } catch (e) {
        userData[gameCode] = [user];
    }
    this.writeUserJson(userData);
    cm.log("cyan", "user connected (total: " + ConnectedUsers + ")");
}

exports.removeUser = function (id, gameCode) {
    ConnectedUsers--;
    let userData = this.getUserJson();
    let index = userData[gameCode].findIndex(x => x.id === id);
    userData[gameCode].splice(index, 1);
    this.writeUserJson(userData);
    cm.log("cyan", "user disconnected (total: " + ConnectedUsers + ")");
}

exports.addItem = function (id, gameCode) {
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

exports.moveItem = function (options, gameCode) {
    let data = this.getRoomJson(gameCode);
    data.gameboard[options.id].x = options.x;
    data.gameboard[options.id].y = options.y;
    this.writeRoomJson(data, gameCode);
    cm.log('yellow', "- moved item " + options.id + " on " + gameCode);
    return options;
}

// JSON handeling
exports.getRoomJson = function (gameCode) {
    try {
        let filePath = 'data/roomdata/' + gameCode + '.json';
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let roomData = JSON.parse(fileContent);
        return roomData;
    } catch (err) {
        cm.log("red", "Requested roomfile not found: " + gameCode + ": " + err);
    }
}

exports.writeRoomJson = function (roomData, gameCode) {
    try {
        let filePath = 'data/roomdata/' + gameCode + '.json';
        let data = JSON.stringify(roomData, null, 4);
        fs.writeFileSync(filePath, data, 'utf8');
    } catch (err) {
        cm.log("red", "Error writing Roomfile: " + gameCode + "\n (" + err + ")");
    }
}

exports.getUserJson = function () {
    try {
        let filePath = 'data/users.json';
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let roomData = JSON.parse(fileContent);
        return roomData;
    } catch (err) {
        cm.log("red", "Requested userfile not found: \n(" + err + ")");
    }
}

exports.writeUserJson = function (roomData) {
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

exports.getCode = function (client) {
    return client.handshake.headers.referer.slice(-5);
}