const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Войти неполучилось!',
	successRedirect: '/',
	successFlash: 'Залогинились отлично, так держать!'
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Разлогинились без проблем. Заходите еще!');
	res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		next();
		return;
	}
	req.flash('error', 'Опа! А надо-бы залогиниться!');
	res.redirect('/login');
}

exports.forgot = async (req, res) => {
	const user = await User.findOne({ email: req.body.email});
	if(!user){
		req.flash('error', 'Да нету аккаунта с таким email-ом!');
		return res.redirect('/login');
	}
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();
	const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	// await mail.send({
	// 	user,
	// 	filename: 'password-reset',
	// 	subject: 'Сброс пароля',
	// 	resetURL
	// });
	req.flash('success', `Вам на почту отправили ссылку для сброса пароля.`);
	res.redirect('/login');
}

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now()}
	});
	if(!user) {
		req.flash('error', 'Токен сброса пароля устарел ли неправилен');
		return res.redirect('/login');
	}
	res.render('reset', { title: 'Сброс вашего пароля'})
}

exports.confirmedPasswords = (req, res, next) => {
	if (req.body.password === req.body['password-confirm']){
		next();
		return;
	}
	req.flash('error', 'А пароли-то не совпадают!');
	res.redirect('back');
}

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now()}
	});
	if(!user) {
		req.flash('error', 'Токен сброса пароля устарел ли неправилен');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Ваш пароль был сброшен! А еще вы теперь залогинены.');
	res.redirect('/');
}