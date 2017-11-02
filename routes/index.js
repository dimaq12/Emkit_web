const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const {catchErrors} = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(itemController.getItems));
router.get('/items', catchErrors(itemController.getItems));
router.get('/add', itemController.addItem);
router.post('/add', 
  itemController.upload,
  catchErrors(itemController.resize),
  catchErrors(itemController.createItem
));
router.post('/add/:id',
  itemController.upload,
  catchErrors(itemController.resize),
  catchErrors(itemController.updateItem
));
router.get('/items/:id/edit', catchErrors(itemController.editItem));

module.exports = router;
