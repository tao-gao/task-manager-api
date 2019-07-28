const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  // task.save().then(() => {
  //   res.send(task)
  // }).catch((e) => {
  //   res.status(400).send(e)
  // })
  try {
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=CreatedAt:desc
router.get('/tasks', auth, async (req, res) => {
  // Task.find({}).then((users) => {
  //   res.send(users)
  // }).catch((e) => {
  //   res.status(500).send(e)
  // })
  const match = {}
  const sort = {}
  if(req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    // const users = await Task.find({owner: req.user._id})
    await req.user.populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip:parseInt(req.query.skip),
          sort
        }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  // Task.findById(_id).then((task) => {
  //   if(!task) {
  //     return res.status(500).send('Task does not exist')
  //   }
  //   res.send(task)
  // }).catch((e) => {
  //   res.status(500).send(e)
  // })
  try {
    const task = await Task.findOne({_id, owner: req.owner._id})
    if (!task) {
      return res.status(400).send('Task does not exist')
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed']
  const isValidOpetation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOpetation) {
    return res.status(400).send({ erro: 'Invalid updates!' })
  }

  try {
    const _id = req.params.id
    // const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
    const task = await Task.findOne({_id: _id, owner: req.user._id})
    if (!task) {
      return res.status(400).send('Task does not exist')
    }

    updates.forEach((update) => {
      task[update] = req.body[update]
    })

    await task.save()


    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(404).send({ error: 'Task does not exist' })
    }
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router