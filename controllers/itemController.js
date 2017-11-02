const mongoose = require('mongoose');
const Item = mongoose.model('Item');
// const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto){
			next(null, true);
		} else {
			next({message: 'Такие файлы нельзя загружать!'})
		}
	} 
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	if(!req.file){
		next();
		return;
	} 
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	console.log(req.body.photo);
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	next();
}

exports.getItems = (req, res) => {
    res.render("index", { title: 'Переходники'});
}
exports.addItem = (req, res) => {
	res.render('editItem', { title: 'Добавить элемент'});
}
exports.createItem = async (req, res) => {
    const item = await (new Item(req.body)).save();
    req.flash('success', `Элемент ${item.name} создан успешно.`);
    res.redirect(`/item/${item.slug}`);
}

exports.getItems = async (req, res) => {
    // const page = req.params.page || 1;
	// const limit = 4;
	// const skip = (page * limit) - limit;
	// const itemsPromise = Item
	// 	.find()
	// 	.skip(skip)
	// 	.limit(limit)
	// 	.sort({created: 'desc' });
	// const countPromise = Store.count();
	// const [stores, count] = await Promise.all([storesPromise, countPromise]);
	// const pages = Math.ceil(count / limit);
	// if(!stores.length && skip){
	// 	req.flash('info', `Hey, you asked for page ${page}, but it doesnt exist. So, you go to page ${pages}`);
	// 	res.redirect(`/stores/page/${pages}`);
	// 	return;
    // }
    const items = await Item.find();
    res.render('items', { title: 'Все переходники', items});
}

exports.editItem = async (req, res) => {
	const item = await Item.findOne({ _id: req.params.id})
	// confirmOwner(item, req.user);
	res.render('editItem', { title: `Edit ${item.name}`, item})
}

exports.updateItem = async (req, res) => {
	// req.body.location.type = 'Point';
	const item = await Item.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true,
		runValidators: true
	}).exec();
	req.flash('success', `Успешно обновили <strong>${item.name}</strong>. <a href="/items/${item.slug}">Просмотреть</a>`);
	res.redirect(`/items/${item._id}/edit`);
}