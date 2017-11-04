const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const itemSchema = new mongoose.Schema({
  name: {
		type: String,
		trim: true,
		required: 'Пожалуйта, введите название!'
	},
	slug: String,
	description: {
		type: String,
		trim: true,
	},
	categories: [String],
	created: {
		type: Date,
		default: Date.now
	},
	photo: String
	
});

itemSchema.pre('save', async function(next){
	if(!this.isModified('name')){
		next();
		return;
	}
	this.slug = slug(this.name);
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9*$])?)$`, 'i');
	const itemsWithSlug = await this.constructor.find({ slug: slugRegEx});
	if(itemsWithSlug.length){
		this.slug = `${this.slug}-${itemsWithSlug.length + 1}`;
	}
	next();
})

itemSchema.statics.getCategoriesList = function(){
	return this.aggregate([
		{$unwind: '$categories'},
		{$group: { _id: '$categories', count: {$sum: 1}}},
		{$sort: {count: -1 }}
	])
}

module.exports = mongoose.model('Item', itemSchema);