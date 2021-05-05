const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

// Create new task

router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body);

  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save();
    res.status(201).send(task);
  } catch(e) {
    res.status(400).send();
  }
  // task.save()
  //   .then(() => {
  //     res.status(201).send(task);
  //   })
  //   .catch((error) => {
  //     res.status(400).send();
  //   })
})

// Get tasks

// for sending back complete/incomplete: GET /tasks?completed=true
// for pagination: GET /tasks?limit=10&skip=20
// for sorting: GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if(req.query.completed) {
    // sneaky clever move: we need booleans, not strings.
    // so we test to see if the query param completed is equal to the string "true"
    // If so, the test returns true, so match.completed is set to true.
    // And it also works for false!
    match.completed = req.query.completed === 'true';
  }

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id });

    // alternative approach using populate()
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate();

    // Display 404 if no tasks were found for the current user
    if(req.user.tasks.length === 0) {
      return res.status(404).send({ error: 'No tasks found.' });
    }

    res.send(req.user.tasks);
  } catch(e) {
    res.status(500).send(e);
  }

  // Task.find({})
  //   .then((tasks) => {
  //     res.send(tasks);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   })
})

// Get single task by ID

router.get(`/tasks/:id`, auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id });

    if(!task) {
      return res.status(404).send('Task not found');
    }

    res.send(task);
  } catch(e) {
    res.status(500).send();
  }

  // Task.findById(_id)
  //   .then((task) => {
  //     if(!task) {
  //       return res.status(404).send('Task not found');
  //     }
  //     res.send(task);
  //   })
  //   .catch((error) => {
  //     res.status(500).send();
  //   })
})

// Update task

router.patch('/tasks/:id', auth, async(req, res) => {
  const allowedUpdates = [ 'description', 'completed' ];
  const updates = Object.keys(req.body);
  const isValid = updates.every(update => allowedUpdates.includes(update));

  if(!isValid) {
    return res.status(400).send({ error: 'Invalid update' });
  }

  try {
    // old way that bypassed the middleware
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // new way
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if(!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.body[update]
    })
    await task.save();
    res.send(task);
  } catch(e) {
    res.status(500).send();
  }
})

// Delete task

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});

    if(!task) {
      return res.status(404).send('Task not found');
    }

    res.send(task);
  } catch(e) {
    res.status(500).send();
  }
})


module.exports = router;
