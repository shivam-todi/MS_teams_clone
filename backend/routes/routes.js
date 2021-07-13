const express = require("express");
router = express.Router();
controller = require("../controller/controller");

router.get("/",controller.home)
router.post("/new-meeting",controller.newMeeting);
router.post("/join-meeting",controller.joinMeeting);
router.get("/:room",controller.joinMeetingRoom);

module.exports = router;