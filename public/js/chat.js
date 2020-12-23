// send message on enter or button click
$('#chatSend').click(sendMessage);
$('#chatInput').keypress(function(e) {
    if (e.which == 13) {
        sendMessage();
        return false;
    }
});

// send message to server
function sendMessage() {
    if ($('#chatInput').val() != "") {
        server.emit('newChatMsg', $('#chatInput').val());
        $('#chatInput').val("");
    }
}


// handle incoming message
server.on('newChatMsg', function(msg) {
    $('#messages').append($('<p>').text(msg));
});