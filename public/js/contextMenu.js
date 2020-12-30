$(document).mousedown(hideMenu);
$('#gameboard div').on("contextmenu", rightClick);

let contextItem = null;

function hideMenu(e) {
    if (e.target.parentNode.id != "contextMenu") {
        $("#contextMenu").css("display", "none");
        contextItem = null;
    }
}

function rightClick(e) {
    e.preventDefault();

    let menu = setupMenu(e.target);
    menu.css("display", "flex");
    menu.css("left", (e.pageX + 10) + "px");
    menu.css("top", (e.pageY + 10) + "px");
    contextItem = e.target;
}

function setupMenu(target) {
    let menu = $("#contextMenu").html('');

    // Flip
    if ($(target).attr("flipable") == "true") {
        menu.append($("<span></span>").text("Umdrehen").attr("action", "flip"));
    }

    // Lock
    if ($(target).attr("locked") == "true") {
        menu.append($("<span></span>").text("Entsperren").attr("action", "unlock"));
    } else {
        menu.append($("<span></span>").text("Sperren").attr("action", "lock"));
    }

    // shuffle
    if ($(target).attr("objtype") == "cardset") {
        menu.append($("<span></span>").text("Mischen").attr("action", "shuffle"));
    }

    // roll
    if ($(target).attr("objtype") == "dice") {
        menu.append($("<span></span>").text("Würfeln").attr("action", "roll"));
    }

    // moveToPrivate
    menu.append($("<span></span>").text("In privaten Bereich").attr("action", "makePrivate"));

    // delete
    menu.append($("<span></span>").text("Entfernen").css("color", "red").attr("action", "remove"));

    return menu;
}

// handle menuclicks
$("#contextMenu").click((e) => {
    console.log($(e.target).attr("action"), contextItem.id);
    $("#contextMenu").css("display", "none");
    contextItem = null;
});

function handleMenuselection(action, id) {
    switch (action) {
        case "flip":
            server.emit("flipItem", id);
            break;
        case "lock":
            server.emit("lockItem", id);
            break;
        case "unlock":
            server.emit("unlockItem", id);
            break;
        case "makePrivate":
            server.emit("makeItemPrivate", id);
            break;
        case "remove":
            server.emit("removeItem", id);
            break;
        case "roll":
            server.emit("rollDice", id);
            break;
        case "shuffle":
            server.emit("shuffleCardset", id);
            break;
        case "getCard":
            server.emit("getCard");
            break;
        default:
            console.log("Unknown action:", action);
    }
}