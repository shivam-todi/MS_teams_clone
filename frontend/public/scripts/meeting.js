
const socket = io();

const videoGrid = $("#meeting-video-grid")[0];

let peer = new Peer(undefined);

const userVideo = $("<video></video>");

let userVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    userVideoStream = stream;
    addVideoToGrid(userVideo,stream);

    answerCall(stream);

    socket.on("joined",(userId)=>{
      const video = $("<video></video>");
      peer.call(userId,stream).on("stream",userVideoStream=>{
          addVideoToGrid(video,userVideoStream);
      });
    });
})

peer.on("open",id => {
    socket.emit("joinMeeting",meetingCode,id,username);
})

const answerCall=(stream) => {
  peer.on('call',call=>{
    call.answer(stream);
    const video = $("<video></video>");
    call.on("stream",userVideoStream=>{
        addVideoToGrid(video,userVideoStream);
    })
})
}

const addVideoToGrid = (video,stream) => {
  video[0].srcObject = stream;
    video.on("loadedmetadata",()=>{
      video[0].play();
    })
    videoGrid.append(video[0]);
}

let chatInput = $("#message-input");

$('html').keydown((event) => {
    if(event.which==13 && chatInput.val().length!=0){
        socket.emit('chat',chatInput.val());
        chatInput.val(''); 
    }
})

socket.on("sendChatMessage",(chatMessage,username,time) => {
    $('#meeting-chat-messages').append(`<li><b>${username}</b><span class="meeting-message-time">${time}</span><br/>${chatMessage}</li>`);

    var chatWindow = $('#meeting-chat-window');
    chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
});

const audioControl = () => {
    const enabled = userVideoStream.getAudioTracks()[0].enabled;

    var button;

    if (enabled) {
      button = `  <button type="button" class="btn btn-secondary">Unmute  <i class="fas fa-microphone-slash" ></i></button>`;
      userVideoStream.getAudioTracks()[0].enabled = false; //disable audio
      
    } else {
      button = `<button type="button" class="btn btn-secondary">Mute  <i class="fas fa-microphone" ></i></button>`;
      userVideoStream.getAudioTracks()[0].enabled = true; //enable audio
    }

    $('#meeting-mute')[0].innerHTML = button;

}

  const videoControl = () => {
    console.log('object')
    let enabled = userVideoStream.getVideoTracks()[0].enabled;

    var button;

    if (enabled) {
      userVideoStream.getVideoTracks()[0].enabled = false;
      button = ` <button type="button" class="btn btn-secondary">Start Video <i class="fas fa-video-slash"></i></button>`;
    } else {
      button = `<button type="button" class="btn btn-secondary">Stop Video <i class="fas fa-video"></i></button>`;
      userVideoStream.getVideoTracks()[0].enabled = true;
    }

    $('#meeting-video-control')[0].innerHTML = button;

  }  

  socket.on("leaveMeeting", () =>{
    $("video")[1].remove();
  });

  socket.on("getParticipants",(meetingCode,users) => {
    participants = $("#meeting-participants");
    participants.empty();
    const displayPicUrl = "https://bmy.guide/assets/img/default_profile_picture.png"
      users.forEach((user) => {
         const userDiv = $(`<li><img src=${displayPicUrl}>${user.username}</li>`);
         participants.append(userDiv);
      });
  })

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

var clipboard = new ClipboardJS('#copy-to-clipboard');

document.querySelector("#copy-to-clipboard").setAttribute("data-clipboard-text",meetingCode);

clipboard.on('success', function(e) {
  let trigger_btn = e.trigger; 
  
  trigger_btn.setAttribute('data-bs-original-title', 'Copied!');

  let tooltip_btn = bootstrap.Tooltip.getInstance(trigger_btn);
  tooltip_btn.show();

  trigger_btn.setAttribute('data-bs-original-title', 'Copy to clipboard');
});

document.querySelector("#meeting-code").setAttribute("value",meetingCode);
document.querySelector("#sender").setAttribute("value",username);

$(function($){
  $("#send-invite-btn").click(function(){
    $.ajax({
      type: "POST",
      url: "inviteParticipant",
      data: $("#invite-form").serialize(),
      success: function(){
        alert("Invite Has Been Sent");
        $("#receiver-email").val('');
      }
    });
  })
})