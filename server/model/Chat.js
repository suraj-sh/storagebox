const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Storage',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
// Virtual property to get the storage name
chatSchema.virtual('storageName', {
    ref: 'Storage',
    localField: 'storage',
    foreignField: '_id',
    justOne: true,
  });
  
  chatSchema.set('toObject', { virtuals: true });
  chatSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Chat', chatSchema);
