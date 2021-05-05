const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

// Create a separate variable containing the Model schema, and pass that into the model call below
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if(!validator.isEmail(value)) {
        throw new Error('Email address is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if(value.toLowerCase().includes('password')) {
        throw new Error('value cannot contain the string \'password\'');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if(value < 0) {
        throw new Error('Age must be a positive number');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
},
{
  timestamps: true
});

// schema.statics allows you to set your own custom static (model) methods on your schema
// In this case we are setting up a findByCredentials() function to test the user login credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if(!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if(!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
}

// schema.methods allows you to create instance methods, i.e. a method that will run on an individul user
// in this case we are creating a method to generate a JWT to authenticate that user
userSchema.methods.generateAuthToken = async function() {
  // this = user in this case
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
}

// Create user object containing only the data we want to send back in the response (not pwd or tokens)
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
}

// Setup virtual property to specify relationship betwene user and tasks
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

// // toJSON = this is how it works
//  this is a bit automagical, but hey

// const pet = {
//   name: 'Luna'
// }
//
// pet.toJSON = function() {
//   console.log(this)
//   return {};
// }
//
// console.log(JSON.stringify(pet));


// HASH PASSWORD BEFORE SAVING IT
// pre allows to specify a function to run on new schema instances before an even occurs
// to them, in this case before users are saved
userSchema.pre('save', async function(next) {
  // In this case, 'this' refers to the user object that is being saved

  if(this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  // tells the program to go onto the next operation, in this case save()
  next();
});

// DELETE USER TASKS WHEN USER IS REMOVED
userSchema.pre('remove', async function(next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
})

// This needs to be at the end of the schema definition
const User = mongoose.model('User', userSchema);

module.exports = User;
