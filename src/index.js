const express = require('express');
require('./db/mongoose'); // we don't need a reference to this; we just run it so db connect occurs
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT; // no longer need to explicitly set our local port here. We are now doing it with environment variables

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`app running at port ${port}`);
})


// PLAYING WITH BCRYPTJS TO FIGHURE OUT HOW TO HASH PASSWORDS

// const bcrypt = require('bcryptjs');
//
// async function myFunction() {
//   const password = 'Red12345!'
//   const hashedPassword = await bcrypt.hash(password, 8);
//
//   console.log(password);
//   console.log(hashedPassword);
//
//   const isMatch = await bcrypt.compare('red12345!', hashedPassword);
//   console.log(isMatch);
// }
//
// myFunction();

// Note: encryption algorithms are two-way — you cna get original string back from them.
// hashing algorithms are one-way only. Instead, you use a matching function to compare the original with the hash

// PLAYING WITH JSONWEBTOKEN TO FIGURE OUT HOW TO USE THEM FOR THINGS LIKE AUTHENTICATION

// const jwt = require('jsonwebtoken');
//
// async function myFunction() {
//   // sign parameters:
//   // data to embed in token, unique identifier, userid is fine
//   // secret used to sign token
//   // options object
//   const token = await jwt.sign({ _id: 'abc123' }, 'this is my secret to sign the token', { expiresIn: '7 days' });
//   console.log(token);
//
//   const data = jwt.verify(token, 'this is my secret to sign the token');
//   console.log(data);
// }
//
// myFunction();

// logged value is our JWT something like eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhYmMxMjMiLCJpYXQiOjE2MTk3NzU5MTJ9.SjgidlHiZ4ZwUZTddvlNe9OWz2BcfmpsyIaNf4Dgs7U
// three base64-encoded (decode using https://www.base64decode.com/) parts separated by periods:
// 1. header: what type, algorithm used to generate it
// 2. body/payload: data we provided
// 3. signature: used to verify the token

// PLAYING WITH MIDDLEWARE
// new custom middleware function

// MAINTENANCE MODE

// const maintenanceMode = true;
//
// app.use((req, res, next) => {
//   if(maintenanceMode) {
//     res.status(503).send('Service currently unavailable: Maintenance being performed');
//   } else {
//     next();
//   }
// })

// SIMPLE EXAMPLE
// app.use((req, res, next) => {
//   console.log(req.method, req.path);
//
//   if(req.method === 'GET') {
//     res.status(500).send('GET requests are disabled');
//   } else {
//     // next instructs express to run the next thing in the chain, e.g. the route handler
//     next();
//   }
//
// });

// PLAYGROUND CODE TO PLAY WITH RELATIONSHIPS, REFS, VIRTUALS
//
// const Task = require('./models/task');
// const User = require('./models/user');
// async function main() {
//   // const task = await Task.findById('608d6f281f43f377ea859ad8');
//   // await task.populate('owner').execPopulate(); // make the owner field the entire user document, not just the ID
//   // console.log(task.owner);
//   const user = await User.findById('608d6bbe4ad0f4774a23f938');
//   await user.populate('tasks').execPopulate();
//   console.log(user.tasks);
// }
//
// main();

// PLAYING WITH UPLOADING IMAGES USING MULTER
// const multer = require('multer');
// const upload = multer({
//   dest: 'images'
// });
//
// app.post('/upload', upload.single('upload'), (req, res) => {
//   res.send();
// })
