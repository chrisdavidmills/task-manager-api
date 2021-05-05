const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');

const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only PNG and JPG/JPEG files accepted.'))
    }

    cb(undefined, true);

    // cb(new Error('File must be a word doc'));
    // cb(undefined, true);
    // cb(undefined, false);
  }
});

const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account');

const router = new express.Router();

router.get('/test', (req, res) => {
  res.send('From router in a new file');
})

// Create new user

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({user, token});
  } catch(e) {
    res.status(400).send(e);
  }
  // user.save()
  //   .then(() => {
  //     res.status(201).send(user);
  //   })
  //   .catch((error) => {
  //     res.status(400).send(error);
  //   })
})

// Log in user

router.post('/users/login/', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch(e) {
    res.status(404).send();
  }
})

// Log out user

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    })

    await req.user.save();
    res.send()
  } catch(e) {
    res.status(500).send();
  }
})

// Log out of all sessions

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send()
  } catch(e) {
    res.status(500).send();
  }
})

// Get users
// NOTE: here we are adding the auth middleware to this specific route

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
})

// THIS ONE IS NOT NEEDED ANY MORE — THE ABOVE ROUTE ALLOWS USER TO GET THEIR OWN DETAILS...
// ...AND USERS SHOULDN'T BE ABLE TO GET THE DETAILS OF OTHER USERS!
// // Get single user by ID
//
// router.get(`/users/:id`, async (req, res) => {
//   const _id = req.params.id;
//
//   try {
//     const user = await User.findById(_id);
//
//     if(!user) {
//       return res.status(404).send('User not found');
//     }
//
//     res.send(user);
//   } catch(e) {
//     res.status(500).send();
//   }
//
//   // User.findById(_id)
//   //   .then((user) => {
//   //     if(!user) {
//   //       return res.status(404).send('User not found');
//   //     }
//   //     res.send(user);
//   //   })
//   //   .catch((error) => {
//   //     res.status(500).send();
//   //   })
// })

// Update existing user

router.patch('/users/me', auth, async(req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValid = updates.every(update => allowedUpdates.includes(update));

  if(!isValid) {
    return res.status(400).send({ error: 'Invalid update' });
  }

  try {
    // new way explicitly updates the user object and saves it to the db manually.
    const user = req.user;
    updates.forEach((update) => {
      user[update] = req.body[update]
    })
    await user.save();

    res.send(user);
  } catch(e) {
    res.status(500).send(e);
  }
})

// Delete user

router.delete('/users/me', auth, async(req, res) => {
  try {
    // We were getting the user from the database, but now we've getting it
    // directly from req.user, as attached to the req object by auth (see auth.js)
    // we can therefore do this a lot more simply, just using req.user.remove()

    // const user = await User.findByIdAndDelete(req.user._id)
    //
    // if(!user) {
    //   return res.status(404).send('User not found');
    // }
    await req.user.remove();
    sendGoodbyeEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch(e) {
    res.status(500).send();
  }
})

// Upload user profile pic

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
},
(error, req, res, next) => {
  // This additional error callback specifies what to do in thye event of an error.
  // in this case we are taking any error returned (as specified in the multer options)
  // And returning them in some useful JSON (the default is a crappy HTML page)
  res.status(400).send({ error: error.message });
})

// Delete user profile pic

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
})

// Display user avatar at specific URL

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if(!user || !user.avatar) {
      throw new Error('No avatar to see!');
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch(e) {
    res.status(404).send();
  }
})

module.exports = router;
