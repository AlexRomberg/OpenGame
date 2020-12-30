$(document).mousedown(hideMenu);
$('#gameboard div').on("contextmenu", rightClick);

function hideMenu() {
    document.getElementById("contextMenu")
        .style.display = "none"
}

function rightClick(e) {
    e.preventDefault();

    let menu = setupMenu(e.target);
    menu.css("display", "flex");
    menu.css("left", (e.pageX + 10) + "px");
    menu.css("top", (e.pageY + 10) + "px");
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

    // moveToPrivate
    menu.append($("<span></span>").text("In privaten Bereich").attr("action", "makePrivate"));

    // delete
    menu.append($("<span></span>").text("Entfernen").css("color", "red").attr("action", "remove"));

    return menu;
}