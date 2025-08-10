const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/SettingsController");

const auth = require('../middleware/authentication.js');

router.get("/", getSettings);
router.patch("/update", auth, updateSettings);

module.exports = router;
