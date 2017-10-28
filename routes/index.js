const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Do work here
router.get('/', itemController.getItems);
router.get('/en', itemController.switchToEn);
router.get('/ru', itemController.switchToRu);

module.exports = router;
