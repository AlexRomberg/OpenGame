// imports
const socket = require('socket.io');
const game = require('./game');

// init
exports.init = function(serverObject) {
    let io = socket(serverObject);

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