console.log('hello world')

const socket = new WebSocket('ws://' + window.location.host + '/ws/test-stat/');

socket.onmessage = function(e) {
    console.log('Server' + e.data);
};

socket.onopen = function(e) {
    socket.send(JSON.stringify({
        'message': 'Hello from client',
        'sender': 'client'
    }));
}; 