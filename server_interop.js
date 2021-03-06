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

const PORT = process.env.PORT || 8080

//let the server server static files
app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

console.log('Starting the server');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

app.post('/v/:client', (req, res) => {
    console.log('post request received')
    let client = req.params.client;

    let downstream = req.body.downstream;
    let upstream = req.body.upstream;

    console.log('\nclient: ' + client + '\tup: ' + upstream + '\tdown: ' + downstream);
    io.to(client).emit(client, {upstream, downstream});
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

io.on('connection', (socket) => {
    console.log('connected');
    socket.on('client', (room) => {
        socket.join(room);
        console.log(room + ' has joined');
    })

    socket.on('remotePhy', (name) => {
        socket.join(name);
        console.log(name+ ' has joined');
    })
})

http.listen(PORT,() => {console.log('listening on port ' + PORT)})


