// consoleModule.js
//---------------------------------------------------
// custom Node.js module to colorize console output
//
// © Alexander Romberg @ KFTG (IMS)
//---------------------------------------------------

exports.log = function (color, text) {
    let colors = {
        "reset": "\x1b[0m",
        "black": "\x1b[30m",
        "red": "\x1b[31m",
        "green": "\x1b[32m",
        "yellow": "\x1b[33m",
        "blue": "\x1b[34m",
        "magenta": "\x1b[35m",
        "cyan": "\x1b[36m",
        "white": "\x1b[37m"
    };
    console.log(colors[color] + "%s" + colors.reset, text)
};