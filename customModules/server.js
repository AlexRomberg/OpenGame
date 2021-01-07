const express = require('express');
const cm = require('./consoleModule');
const rand = require('./random');
const Cookies = require('./cookie');
const game = require('./game');


exports.init = function(port) {
    // init modules
    var app = express();
    var server = app.listen(port);
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
        let cookies = Cookies.parse(req.headers.cookie);
        if (cookies.userId === undefined || cookies.userName === undefined) {
            res.redirect('/?new');
        } else {

            if ('game' in req.query) {
                game.start(req.query.game, res);
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
        let cookies = Cookies.parse(req.headers.cookie);
        if (!cookies) {
            res.redirect('/?' + gameCode);
            // } else if (!game.exists(gameCode)) {
            // res.redirect('/');
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

    return server;
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