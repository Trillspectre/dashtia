console.log('hello world')
const dashboardSlug = document.getElementById('dashboard-slug').textContent.trim()
console.log(dashboardSlug)

const socket = new WebSocket(`ws://${window.location.host}/ws/${dashboardSlug}/`);

socket.onmessage = function(e) {
    console.log('Server' + e.data);
    const {sender, message} = e.data
    console.log(sender)
    console.log(message)
};

socket.onopen = function(e) {
    socket.send(JSON.stringify({
        'message': 'Hello from client',
        'sender': 'client'
    }));
}; 