const videoGrid = document.getElementById('video-grid')
var text = document.getElementById('chat_message');
const myVideo = document.createElement('video');
const socket = io('http://localhost:3000/');
myVideo.muted = true;

// username


// my own id
const peer = new Peer(undefined, {
  host: '/',
  port: 3000,
  path: '/peerjs'
});

// connect with client
peer.on('open', (id) => {
  console.log(id)
//  let name;
//   document.getElementById('signup').addEventListener('click', () => {
//     var username = document.getElementById('username');
//     if (username.value.length !== 0) {
//       console.log(username.value)
//       name = username.value;
//     }
//   })
//   console.log(name);
  socket.emit('join-room', ROOM_ID, id ) 
})

let myVideoStream;
const config = {
  video: true,
  audio: false
}


// allows to access camera and microphone 
navigator.mediaDevices.getUserMedia(config)
  .then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    // answer
    peer.on('call', call => {
      const video = document.createElement('video');

      call.answer(stream); // Answer the call with an A/V stream.
      // add a view
      call.on('stream', function (userVideoStream) {
        // Show stream in some video/canvas element.
        addVideoStream(video, userVideoStream)
      });
    });

    // take [user id] from the server
    // make a call 
    socket.on("user-connected", (userId) => {
      console.log(userId)
      connectToNewUser(userId, stream);
    })

    // chat 
    var listMessage = document.getElementsByClassName('messages');
    window.addEventListener('keydown', e => {
      if ((e.which === 13 || e.keyCode === 13) && text.value.length !== 0) {
        console.log(text.value)
        socket.emit('send-message', text.value);
        text.value = "";
      }
    })
    socket.on('message', (message, userId) => {
      console.log("from server " + message + " " + userId)
      var li = document.createElement('li');
      li.innerHTML = message;
      listMessage[0].appendChild(li);
    })


  }).catch(err => {
    console.log("failed to load")
  })

// create video and append it
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video)
}




// connect to new user, create a view of new user
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}



