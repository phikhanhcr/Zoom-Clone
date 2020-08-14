
const express = require('express')
const app = express();
var server = require('http').createServer(app);
const shortid = require('shortid');
var io = require('socket.io').listen(server);
const port = 3000;
const { ExpressPeerServer } = require('peer');
const peerServer =
  ExpressPeerServer(server,
    { debug : true }
  );

app.use('/peerjs', peerServer)
app.set('view engine', 'ejs')
app.use(express.static("public"));
var id = shortid.generate();
app.get('/', (req, res) => {
  res.redirect(`/${id}`)
})
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// connect server and client
io.on("connection", socket => {
  var arrUserId = [];
  socket.on('join-room', (roomId, userId) => {
    // Adds the client to the room
    arrUserId.push(userId)
   
    socket.join(roomId)
    // send to everyone except me
    socket.to(roomId).broadcast.emit("user-connected", userId );

    // receive from client 
    socket.on('send-message' , mess => {
      
      socket.emit('message' , mess, userId);
    })
  })
})

server.listen(port, () => {
  console.log('listening on *:' + port);
});