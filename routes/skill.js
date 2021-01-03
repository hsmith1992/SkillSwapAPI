const express = require("express");
const router = express.Router();
const { create, read, update, remove, list, skillById } = require("../controllers/skill");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/skill/:skillId", read);
router.post("/skill/create/:userId", requireSignin, isAuth, isAdmin, create);
router.put("/skill/:skillId/:userId", requireSignin, isAuth, isAdmin, update);
router.delete("/skill/:skillId/:userId", requireSignin, isAuth, isAdmin, remove);
router.get("/skills/", list);




router.param("userId", userById);
router.param("skillId", skillById);

module.exports = router;
