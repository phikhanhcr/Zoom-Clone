const socket = io('http://localhost:3000/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true;

// my own id
const peer = new Peer(undefined, {
  host: '/',
  port: 3000,
  path: '/peerjs'
});

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
      connectToNewUser(userId, stream);
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

// connect with client
peer.on('open', (id) => {
  console.log(id)
  socket.emit('join-room', ROOM_ID, id)
})


// connect to new user, create a view of new user
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}


