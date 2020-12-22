$('#newRoomBtn').click(() => {
    window.location.href = '/new';
});

$('#joinBtn').click(() => {
    if ($('#codeInput')[0].hidden) {
        $('#newRoomBtn').hide();
        $('#codeInput')[0].hidden = false;
        $('#codeInput').focus();
    } else {
        if ($('#codeInput')[0].validity.valid) {
            window.location.href = '/' + $('#codeInput').val();
        }
    }
});

$('#codeInput').keypress(function(e) {
    if (e.which == 13) {
        if ($('#codeInput')[0].validity.valid) {
            window.location.href = '/' + $('#codeInput').val();
        }
        return false;
    }
});