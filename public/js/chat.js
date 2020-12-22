// send Message on Enter
$('#chatInput').keypress(function(e) {
    if (e.which == 13) {
        if ($('#chatInput').val() != "") {
            server.emit('newChatMsg', $('#chatInput').val());
            $('#chatInput').val("");
        }
        return false;
    }
});

// send Message on Button pressed
$('#chatSend').click(function() {
    if ($('#chatInput').val() != "") {
        server.emit('newChatMsg', $('#chatInput').val());
        $('#chatInput').val("");
    }
});


// handle incoming message
server.on('newChatMsg', function(msg) {
    $('#messages').append($('<p>').text(msg));
});