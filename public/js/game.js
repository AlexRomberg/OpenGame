let server = io();
let gameroom = getGameCode();

function getGameCode() {
    let url = window.location.href;
    return url.slice(-5);
}

$('.library img').click(function (sender) {
    console.log(sender.target.id);
    server.emit('addItem', sender.target.id);
});

// handle incoming changes
server.on('addItem', function (item) {
    let object = $('<div></div>')
        .append($("<img>").attr('src', ("/res/gamedata/objectdata/" + item.image)).attr('alt', item.name))
        .attr('objType', item.type)
        .attr('id', item.id)
        .attr('flipable', item.flipable)
        .attr('locked', item.locked)
        .css('top', item.y)
        .css('left', item.x)
        .css('transform', "rotate(" + item.rotation + "deg)")
        .addClass('animated');
    $("#gameboard").append(object);
    $('#gameboard div').on("contextmenu", rightClick);
});

server.on('moveItem', function (options) {
    $("#" + options.id).css('top', options.y + "px")
    $("#" + options.id).css('left', options.x + "px")
});

// draggable items
var dragItem = null;
var container = $("#gameboard");

var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;

container.on("touchstart", dragStart);
container.on("touchend", dragEnd);
container.on("touchmove", drag);

container.on("mousedown", dragStart);
container.on("mouseup", dragEnd);
container.on("mousemove", drag);

function dragStart(e) {
    if (e.target.id != "gameboard" && e.button != 2 && $(e.target).attr('locked') != "true") {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - parseInt($(e.target).css('left'));
            initialY = e.touches[0].clientY - parseInt($(e.target).css('top'));
        } else {
            initialX = e.clientX - parseInt($(e.target).css('left'));
            initialY = e.clientY - parseInt($(e.target).css('top'));
        }

        dragItem = e.target;
        dragItem.classList.remove('animated');
    }
}

function dragEnd(e) {
    if (dragItem != null) {
        initialX = currentX;
        initialY = currentY;
        server.emit('moveItem', {
            id: dragItem.id,
            x: parseInt($(dragItem).css('left')),
            y: parseInt($(dragItem).css('top'))
        });
        dragItem.classList.add('animated');
        dragItem = null;
    }
}

function drag(e) {
    if (dragItem != null) {
        if (e.buttons > 0) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            if (currentX < 0) { currentX = 0; }
            if (currentY < 0) { currentY = 0; }
            if (currentX < 0) { currentX = 0; }
            if (currentX < 0) { currentX = 0; }

            dragItem.style.left = currentX + "px";
            dragItem.style.top = currentY + "px";
        } else {
            dragEnd(e);
        }
    }
}

// Cookies
function getCookie(name) {
    let result = document.cookie.match("(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)")
    return result ? result.pop() : false
}