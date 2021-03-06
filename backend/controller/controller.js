const {v4: uuidv4} = require('uuid');
require("dotenv").config();

exports.home = (req,res) => {
    res.render("home");
}

exports.newMeeting = (req,res) => {
    res.redirect(`/meet?meetingCode=${uuidv4()}&username=${req.body.username}`);
}

exports.joinMeeting = (req,res) => {
    res.redirect(`/meet?meetingCode=${req.body.meetingCode}&username=${req.body.username}`);
}

exports.joinMeetingRoom =(req,res)=>{
    res.render("meeting",{meetingCode: req.params.meetingCode});
}
