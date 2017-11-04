const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Нужно заполнить автора!'
  },
  item: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    required: 'Нужно указать элемент!'
  },
  text: {
    type: String,
    required: 'Надо хоть что-то написать в отзыв!'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

function autopopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);
