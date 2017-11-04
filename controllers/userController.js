const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
	res.render('login', { title: 'Войти'});
}

exports.registerForm = (req, res) => {
	res.render('register', { title: 'Регистрация'});
}

exports.validateRegister = (req, res, next) => {    
	req.sanitizeBody('name');
	req.checkBody('name', 'Введите имя').notEmpty();
	req.checkBody('email', 'Плохой email!').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Пароль надо ввести по любому!').notEmpty();
	req.checkBody('password-confirm', 'Подтверждение пароля не может быть пустым!').notEmpty();
	req.checkBody('password-confirm', 'Опа! а пароли-то не совпадают!').equals(req.body.password);

	const errors = req.validationErrors();
	if(errors){
		req.flash('error', errors.map(err => err.msg));
		res.render('register', { title: 'Регистрация', body: req.body, flashes: req.flash()});
		return;
	}
	next();
};

exports.register = async (req, res, next) => {
	const user = new User({email: req.body.email, name: req.body.name});
	const register = promisify(User.register, User);
	await register(user, req.body.password);
	next();
}

exports.account = (req, res) => {
	res.render('account', { title: 'Изменение аккаунта'});
};

exports.updateAccount = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findOneAndUpdate(
		{ _id: req.user._id},
		{ $set: updates},
		{ new: true, runValidators: true, context: 'query'}
	);
	req.flash('success', 'Профиль обновлен!')
	res.redirect('back')
}