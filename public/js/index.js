var redirect = "";


showCookie();

function proceed(step) {
    switch (step) {
        case 'selection':
            setUserIdIfNeeded();
            showSelection();
            break;
        case 'name':
            showName();
            break;
        case 'checkName':
            checkName();
            break;
        case 'done':
            window.location.href = redirect;
            break;
        default:
            console.log("IndexNotFound");
    }
}

function showCookie() {
    if (!getCookie("userId")) {
        $('#info').show();
        $('#nameInput').hide();
        $('#codeInput').hide();
        $('#newRoomBtn').hide();
        $('#joinBtn').hide();
        $('#next').show().attr('next', 'selection');
    } else {
        proceed('selection');
    }
}

function showSelection() {
    let next = window.location.search;
    let regex = /^\?(([0-9]{5})|(new))$/
    if (next != "" && regex.test(next)) {
        redirect = "/" + next.substr(1);
        proceed('name');
    } else {
        $('#info').hide();
        $('#nameInput').hide();
        $('#codeInput').hide();
        $('#newRoomBtn').show();
        $('#joinBtn').show();
        $('#next').hide().attr('next', "");
    }
}

function showCode() {
    $('#newRoomBtn').hide();
    $('#codeInput').show().focus();
    $('#joinBtn').text('Weiter');
    $('#next').text('Beitreten');
}

function hideCode() {
    if ($('#codeInput')[0].validity.valid) {
        redirect = '/' + $('#codeInput').val();
        proceed('name');
    }
}

function showName() {
    if (!getCookie("userName")) {
        $('#info').hide();
        $('#nameInput').show().focus();
        $('#codeInput').hide();
        $('#newRoomBtn').hide();
        $('#joinBtn').hide();
        $('#next').show().attr('next', "checkName").text('Weiter');
    } else {
        proceed('done');
    }
}

function checkName() {
    if ($('#nameInput')[0].validity.valid) {
        setCookie('userName', $('#nameInput').val(), 10);
        proceed('done');
    }
}

$('#next').click(() => {
    proceed($('#next').attr('next'));
});

$('#newRoomBtn').click(() => {
    redirect = '/new';
    showName();
});

$('#joinBtn').click(() => {
    if ($('#codeInput')[0].style.display == 'none') {
        showCode();
    } else {
        hideCode();
    }
});

$('#codeInput').keypress(function (e) {
    if (e.which == 13) {
        hideCode();
        return false;
    }
});

$('#nameInput').keypress(function (e) {
    if (e.which == 13) {
        proceed("checkName");
        return false;
    }
});

function setUserIdIfNeeded() {
    if (!getCookie("userId")) {
        setCookie("userId", userId, 10);
    }
}

// Cookies
function getCookie(name) {
    let result = document.cookie.match("(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)")
    return result ? result.pop() : false
}

function setCookie(name, value, time) {
    var d = new Date();
    d.setTime(d.getTime() + (time * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/; SameSite=strict";
}