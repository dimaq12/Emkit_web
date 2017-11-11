const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const User = mongoose.model('User');
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
    res.render("index", { title: 'Продукты'});
}
exports.addItem = (req, res) => {
	res.render('editItem', { title: 'Добавить элемент'});
}
exports.createItem = async (req, res) => {
	req.body.author = req.user._id;
	const item = await (new Item(req.body)).save();
	req.flash('success', `Элемент ${item.name} создан успешно.`);
	res.redirect(`/item/${item.slug}`);
}

exports.getItems = async (req, res) => {
  const page = req.params.page || 1;
	const limit = 6;
	const skip = (page * limit) - limit;
	const itemsPromise = Item
		.find()
		.skip(skip)
		.limit(limit)
		.sort({created: 'desc' });
	const countPromise = Item.count();
	const [items, count] = await Promise.all([itemsPromise, countPromise]);
	const pages = Math.ceil(count / limit);
	if(!items.length && skip){
		req.flash('info', `Эй, вы перешли на страницу ${page}, а ее нет! Поэтому мы вас направим к странице ${pages}`);
		res.redirect(`/items/page/${pages}`);
		return;
    }
	res.render('items', { title: 'Все продукты', items, page, pages});
}

const confirmOwner = (item, user) => {
	if(!item.author.equals(user._id)){
		throw Error('Вы можете редактировать только свои элементы!');
	}
}

exports.editItem = async (req, res) => {
	const item = await Item.findOne({ _id: req.params.id})
	confirmOwner(item, req.user);
	res.render('editItem', { title: `Редактирование ${item.name}`, item})
}

exports.updateItem = async (req, res) => {
	const item = await Item.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true,
		runValidators: true
	}).exec();
	req.flash('success', `Успешно обновили <strong>${item.name}</strong>. <a href="/item/${item.slug}">Просмотреть</a>`);
	res.redirect(`/items/${item._id}/edit`);
}

exports.getItemBySlug = async (req, res, next) => {
	const item = await Item.findOne({ slug: req.params.slug}).populate('author reviews');
	if(!item){
		return next();
	}
	res.render('item', {item: item, title: item.name});
}

exports.getItemsByCategory = async (req, res) => {
	const category = req.params.category;
	console.log(category);
	const categoryQuery = category || { $exists: true};
	const categoriesPromise = Item.getCategoriesList();
	const itemsPromise = Item.find({ categories: categoryQuery });
	const [categories, items] = await Promise.all([categoriesPromise, itemsPromise]);
	res.render('category', {categories, title: 'Категории', category, items});
}

exports.searchItems = async (req, res) => {
	const items = await Item.find({
		$text: {
			$search: req.query.q
		}
	}, {
		score: { $meta: 'textScore'}
	}).sort({
		score: { $meta: 'textScore'}
	}).limit(5)
	res.json(items)
}

exports.heartItem = async (req, res) => {
	const hearts = req.user.hearts.map(obj => obj.toString());
	const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
	const user = await User
		.findByIdAndUpdate(req.user._id,
		{ [operator]: { hearts: req.params.id }},
		{ new: true}
	)
	res.json(user);
}

exports.getHearts = async (req, res) => {
	const items = await Item.find({
		_id: { $in: req.user.hearts }
	});
	res.render('items', { title: 'Популярные элементы', items });
}

exports.getTopItems = async (req, res) => {
	const items = await Item.getTopItems();
	res.render('topItems', { items, title:'Топ'})
}

