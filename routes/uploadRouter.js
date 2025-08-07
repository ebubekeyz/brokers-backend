const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication.js');

const upload = require('../controllers/uploadImageController');

router.route('/').post(auth,upload);

module.exports = router;
