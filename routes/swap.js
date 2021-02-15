const express = require("express");
const router = express.Router();
const { requireSignin, isAuth } = require("../controllers/auth");
const { create, isParticipant, images, image, swapById, chat, sendMessage, read, swapOffer } = require("../controllers/swap");
const { imageById } = require("../controllers/image");
const { userById } = require("../controllers/user");



router.put("/swap/create/:userId", requireSignin, isAuth, create);
router.get("/swap/read/:swapId/:userId", requireSignin, isAuth, isParticipant, read);
router.get("/swap/images/:swapId/:userId", requireSignin, isAuth, isParticipant, images);
router.get("/swap/image/:swapId/:imageId/:userId", requireSignin, isAuth, isParticipant, image);
router.get("/swap/chat/:swapId/:userId", requireSignin, isAuth, isParticipant, chat);
router.put("/swap/chat/:swapId/:userId/", requireSignin, isAuth, isParticipant, sendMessage);
router.put("/swap/offer/:swapId/:userId/", requireSignin, isAuth, isParticipant, swapOffer);


router.param("userId", userById);
router.param("swapId", swapById);
router.param("imageId", imageById);

module.exports = router;