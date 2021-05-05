const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // create reference to User model
  }
}, {
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema);


// Note: Mongoose automatically creates a collection to store your documents in, with the model name
// lower-cased and pluralised, e.g. Task instances are stored in "tasks"

module.exports = Task;
