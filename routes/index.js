const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const articlesController = require('../controllers/articlesController');
const reviewController = require('../controllers/reviewController');
const {catchErrors} = require('../handlers/errorHandlers');

// Do work here
// router.get('/', catchErrors(itemController.getItems));
router.get('/', catchErrors(itemController.getMainCategories));
router.get('/items', catchErrors(itemController.getItems));
router.get('/items/page/:page', catchErrors(itemController.getItems));
router.get('/add', authController.isLoggedIn, itemController.addItem);
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

// Login/logout/register
router.get('/login', userController.loginForm);
router.get('/logout', authController.logout);
router.post('/login', authController.login);
// router.get('/register', userController.registerForm);
// router.post('/register',
// 	userController.validateRegister,
// 	userController.register,
// 	authController.login
// );	

// Articles
router.get('/articles', catchErrors(articlesController.showAllArticles));
router.get('/articles/balancer-assembly', catchErrors(articlesController.balancerAssembly));

// Buy
router.get('/buy', catchErrors(itemController.buyItems));

// Contacts
router.get('/contacts', catchErrors(itemController.contactUs));

// User account
router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
// router.post('/account/forgot', catchErrors(authController.forgot));

// API
router.get('/api/search', catchErrors(itemController.searchItems));
router.post('/api/items/:id/heart', catchErrors(itemController.heartItem));

// Hearts
router.get('/hearts', authController.isLoggedIn, catchErrors(itemController.getHearts));

// Reviews
router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));

// TOP
// router.get('/top', catchErrors(itemController.getTopItems));

module.exports = router;
