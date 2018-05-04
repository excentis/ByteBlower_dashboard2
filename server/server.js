const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const bodyParser = require('body-parser');
const path = require('path');

const PORT = process.env.PORT || 8080

//let the server server static files
app.use(express.static(path.join(__dirname,'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.post('/:client', (req, res) => {
    let client = req.params.client;

    let downstream = req.body.downstream;
    let upstream = req.body.upstream;

    console.log('\nclient: ' + client + '\tup: ' + upstream + '\tdown: ' + downstream);
    io.to(client).emit(client, {upstream, downstream});
    res.send({});
})

io.on('connection', (socket) => {
    console.log('connected');
    socket.on('client', (room) => {
        socket.join(room);
        console.log(room + ' has joined');
    })
})

http.listen(PORT, "10.1.1.17", () => {console.log('listening on port ' + PORT)})


