exports.getItems = (req, res) => {
   
    res.render("index", {
        title: req.i18n.__("title")
    });
}

exports.addItem = (req, res) => {
	res.render('editItem', { title: req.i18n.__('Add_Item')});
}

exports.switchToEn = (req, res) => {
    res.cookie('locale', 'en');
    res.redirect('/');
}

exports.switchToRu = (req, res) => {
    res.cookie('locale', 'ru');
    res.redirect('/');
}