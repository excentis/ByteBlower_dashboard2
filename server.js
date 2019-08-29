    /**
 * Wat modems betreft hebben we dit jaar AVM, Broadcom Limited, Hitron, Sagemcom, Technicolor and Ubee Interactive.

   Voor CCAP/Remote PHY hebben we: BKtel, Casa, Cisco, Commscope, DCT DELTA, DEV Systemtechnik, Huawei, Nokia, Teleste, Vecima Networks and Vector Technologies.   
 */

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const bodyParser = require('body-parser');
const path = require('path');

const PORT = process.env.PORT || 80
//let the server server static files
app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

console.log('Starting the server');

let clients = {};
addClient = function(client_name) {
    if (client_name in clients){
        let total_up = parseInt(clients[client_name]['total_up']);
        let total_down = parseInt(clients[client_name]['total_down']);
        console.log('\nclient: ' + client_name + '\tup: ' + total_up + '\tdown: ' + total_down);
        io.to(client_name).emit(client_name, {upstream: 0, downstream: 0,  total_up: total_up, total_down: total_down});
    }else {
        clients[client_name] = {total_up: 0, total_down:0}
    }
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

app.post('/v/:client', (req, res) => {
    console.log('post request received')
    let client = req.params.client;

    let downstream = req.body.downstream;
    let upstream = req.body.upstream;
    let total_up = clients[client]['total_up'] += upstream;
    let total_down = clients[client]['total_down'] += downstream;
    // console.log('\nclient: ' + client + '\tup: ' + upstream + '\tdown: ' + downstream + '\ttotalup: ' + total_up + '\ttotaldown: ' + total_down);
    io.to(client).emit(client, {upstream, downstream});
    clients[client]['total_up'] = total_up;
    clients[client]['total_down'] = total_down;
    res.send({});
})

app.post('/rp/:phyName', (req, res) => {
    console.log('post request received')
    let phy = req.params.phyName;

    let pingResponse = req.body.pingResponse
    let phyIp = req.body.ip
    console.log(pingResponse)
    console.log('\nphy: ' + phy + '\tping response: ' + pingResponse);
    io.to(phy).emit(phy, {pingResponse, phyIp});
    res.send({});
})

app.post('/scte/xra', (req, res) => {
    console.log('xra request received')
    console.log(req.body);
    var modems = req.body.modems;
    var profiles = req.body.profiles;
    io.to('xradata').emit('xradata', {modems, profiles})
    res.send({});
})

io.on('connection', (socket) => {
    console.log('connected');
    socket.on('client', (room) => {
        socket.join(room);
        addClient(room)
    })

    console.log(clients)
    socket.on('remotePhy', (name) => {
        socket.join(name);
        console.log(name+ ' has joined');
    })

    socket.on('xra', (name) => {
        socket.join(name);
        console.log(name+ ' has joined');
    })
});

http.listen(PORT, '0.0.0.0', () => {console.log('listening on port ' + PORT)});


