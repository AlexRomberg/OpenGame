$(document).mousedown(hideMenu);
$('#gameboard div').on("contextmenu", rightClick);
$('#personalSpace *').on("contextmenu", rightClickPrivate);

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
    if (($(menu).height() + e.pageY) < window.innerHeight) {
        menu.css("top", (e.pageY + 10) + "px");
    } else {
        menu.css("top", (window.innerHeight - $(menu).height() - 10) + "px");
    }
    contextItem = e.target;
}

function rightClickPrivate(e) {
    e.preventDefault();

    let menu = $("#contextMenu").html('');
    if ($(e.target).attr("flipable") == "true") {
        menu.append($("<span></span>").text("Umdrehen").attr("action", "flipPrivate"));
    }
    menu.append($("<span></span>").text("Rauslegen").attr("action", "makePublic"));

    menu.css("display", "flex");
    menu.css("left", (e.pageX + 10) + "px");
    if (($(menu).height() + e.pageY) < window.innerHeight) {
        menu.css("top", (e.pageY + 10) + "px");
    } else {
        menu.css("top", (window.innerHeight - $(menu).height() - 10) + "px");
    }
    contextItem = e.target;
}

function setupMenu(target) {
    let menu = $("#contextMenu").html('');
    addObjectCardsetMenu(menu, target);
    addObjectMenu(menu, target);
    addCardsetMenu(menu, target);
    addDiceMenu(menu, target);
    addGeneralMenu(menu);
    return menu;
}

function addObjectCardsetMenu(menu, target) {
    if ($(target).attr("objtype") == "object" || $(target).attr("objtype") == "cardset") {
        // Lock
        if ($(target).attr("locked") == "true") {
            menu.append($("<span></span>").text("Entsperren").attr("action", "unlock"));
        } else {
            menu.append($("<span></span>").text("Sperren").attr("action", "lock"));
            // rotate
            menu.append($("<span></span>").text("Drehen (15°)").attr("action", "rotate"));
            menu.append($("<span></span>").text("Drehen (-15°)").attr("action", "rotateBack"));
        }
    }
}

function addObjectMenu(menu, target) {
    if ($(target).attr("objtype") == "object" && $(target).attr("locked") == "false") {
        // Flip
        if ($(target).attr("flipable") == "true") {
            menu.append($("<span></span>").text("Umdrehen").attr("action", "flip"));
        }
        // moveToPrivate
        menu.append($("<span></span>").text("Aufnehmen").attr("action", "makePrivate"));
    }
}

function addCardsetMenu(menu, target) {
    if ($(target).attr("objtype") == "cardset") {
        // shuffle
        menu.append($("<span></span>").text("Mischen").attr("action", "shuffle"));
        // getPrivateCard
        menu.append($("<span></span>").text("Karte Aufnehmen").attr("action", "getPrivateCard"));
        // getPublicCard
        menu.append($("<span></span>").text("Karte Aufdecken").attr("action", "getPublicCard"));
    }
}

function addDiceMenu(menu, target) {
    if ($(target).attr("objtype") == "dice") {
        // roll
        menu.append($("<span></span>").text("Würfeln").attr("action", "roll"));
    }
}

function addGeneralMenu(menu) {
    // remove
    menu.append($("<span></span>").text("Entfernen").css("color", "red").attr("action", "remove"));
}

// handle menuclicks
$("#contextMenu").click((e) => {
    let closeMenu = handleMenuselection($(e.target).attr("action"), contextItem.id)
    if (closeMenu) {
        $("#contextMenu").css("display", "none");
        contextItem = null;
    }
});

function handleMenuselection(action, id) {
    let hide = true;
    switch (action) {
        case "unlock":
            server.emit("unlockItem", id);
            break;
        case "lock":
            server.emit("lockItem", id);
            break;
        case "rotate":
            $("#gameboard #" + id).removeClass('animated');
            server.emit("rotateItem", { id, deg: 15 });
            hide = false;
            break;
        case "rotateBack":
            $("#gameboard #" + id).removeClass('animated');
            server.emit("rotateItem", { id, deg: -15 });
            hide = false;
            break;
        case "flip":
            server.emit("flipItem", id);
            break;
        case "flipPrivate":
            server.emit("flipItemPrivate", { id, userId: getCookie('userId') });
            break;
        case "makePrivate":
            server.emit("makePrivate", { id, userId: getCookie('userId') });
            break;
        case "shuffle":
            server.emit("shuffleItem", id);
            break;
        case "getPrivateCard":
            server.emit("getPrivateCard", { id, userId: getCookie('userId') });
            break;
        case "getPublicCard":
            server.emit("getPublicCard", id);
            break;
        case "roll":
            server.emit("rollDice", id);
            break;
        case "remove":
            if (confirm("Dieses Objekt wirklich entfernen?")) {
                server.emit("removeItem", id);
            }
            break;
        case "makePublic":
            server.emit("makePublic", { id, userId: getCookie('userId') });
            break;
        default:
            console.log("Unknown action:", action);
    }
    return hide;
}