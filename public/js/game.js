let server = io();
let gameroom = getGameCode();

function getGameCode() {
    let url = window.location.href;
    return url.slice(-5);
}

$('.library img').click((sender) => {
    console.log(sender.target.id);
    server.emit('addItem', sender.target.id);
});

// handle incoming changes
server.on('addItem', (item) => {
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

server.on('moveItem', (params) => {
    $("#" + params.id).css('top', params.y + "px");
    $("#" + params.id).css('left', params.x + "px");
});

server.on('removeItem', (id) => {
    $("#gameboard #" + id).remove();
});

server.on('setItemLockstate', (params) => {
    $("#gameboard #" + params.id).attr("locked", params.locked);
});

server.on('setItemRotation', (params) => {
    $("#gameboard #" + params.id).css("transform", "rotate(" + params.rotation + "deg)");
    $("#gameboard #" + params.id)[0].offsetHeight;
    $("#gameboard #" + params.id).addClass('animated');
});

server.on('updateImage', (id) => {
    let d = new Date();
    $("#gameboard #" + id + " img").attr("src", "/" + getGameCode() + "/" + id + "?" + d.getTime());
});

server.on('addPrivateItem', (obj) => {
    console.log(obj);
    let object = $("<img>")
        .attr('src', ("/res/gamedata/objectdata/" + obj.item.image))
        .attr('alt', obj.item.name)
        .attr('objType', obj.item.type)
        .attr('id', obj.id)
        .attr('flipable', obj.item.flipable)
        .attr('locked', obj.item.locked)
        .css('margin-left', '5px');
    $("#personalSpace").append(object);
    $('#personalSpace *').on("contextmenu", rightClickPrivate);
});

server.on('deletePrivateItem', (id) => {
    console.log(id);
    $("#personalSpace #" + id).remove();
});



// draggable items
var dragItem = null;
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;

$("#gameboard").on("touchstart", dragStart);
$("#gameboard").on("touchend", dragEnd);
$("#gameboard").on("touchmove", drag);

$("#gameboard").on("mousedown", dragStart);
$("#gameboard").on("mouseup", dragEnd);
$("#gameboard").on("mousemove", drag);

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