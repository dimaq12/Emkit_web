const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
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

router.get('/item/:slug', catchErrors(itemController.getItemBySlug));
router.get('/categories/', catchErrors(itemController.getItemsByCategory));
router.get('/categories/:category', catchErrors(itemController.getItemsByCategory));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.post('/register',
	userController.validateRegister,
	userController.register,
	authController.login
);	

module.exports = router;
