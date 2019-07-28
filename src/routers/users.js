const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')
const router = new express.Router()


router.post('/users', async (req, res) => {
  const user = new User(req.body)
  // user.save().then(() => {
  //   res.send(user)
  // }).catch((e) => {
  //   res.status(400).send(e)
  // })
  try{
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({user, token})
  } catch(e) {
    res.status(400).send(e)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    // res.send({user: user.getPublicProfile(), token})
    res.send({user, token})
  } catch(e) {
    res.status(400).send(e)
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
     res.send()
  } catch(e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch(e) {
    res.status(500).send()
  }
})

const upload = multer({
  //dest: 'avatar',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  }
})

router.get('/users/me',auth, async (req, res) => {
  // User.find({}).then((users) => {
  //   res.send(users)
  // }).catch((e) => {
  //   res.status(500).send(e)
  // })
  // try {
  //   const users = await User.find({})
  //   res.send(users)
  // } catch(e) {
  //   res.status(500).send(e)
  // }
  res.send(req.user)
})

// router.get('/users/:id', async (req, res) => {
//   console.log(req.params)
//   const _id = req.params.id;
//   // User.findById(_id).then((user) => {
//   //   if(!user) {
//   //     return res.status(400).send('User does not exit')
//   //   }
//   //   res.send(user)
//   // }).catch((e) => {
//   //   res.status(500).send(e)
//   // })
//   try {
//     const user = await User.findById(_id)
//     if(!user) {
//       return res.status(400).send()
//     }
//     res.send(user)
//   } catch(e) {
//     res.status(500).send(e)
//   }
// })

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOpetation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

  if(!isValidOpetation) {
    return res.status(400).send({error: 'Invalid updates:'})
  }

  try {
    const user = req.user
    updates.forEach((update) => {
      user[update] = req.body[update]
    })

    await user.save()

    res.send(user)
  } catch(e) {
    res.status(500).send(e)
  }
})

// router.patch('/users/:id', async (req, res) => {
//   const updates = Object.keys(req.body)
//   const allowedUpdates = ['name', 'email', 'password', 'age']
//   const isValidOpetation = updates.every((update) => {
//     return allowedUpdates.includes(update)
//   })

//   if(!isValidOpetation) {
//     return res.status(400).send({error: 'Invalid updates:'})
//   }

//   try {
//     const user = await User.findById(req.params.id);
//     updates.forEach((update) => {
//       user[update] = req.body[update]
//     })

//     await user.save()

//     // const user =  await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
//     if(!user) {
//       res.status(400).send()
//     }
//     res.send(user)
//   } catch(e) {
//     res.status(500).send(e)
//   }
// })

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if(!user) {
    //   return res.status(404).send()
    // }
    req.user.remove()
    sendCancellationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch(e) {
    res.status(500).send(e)
  }
})

// router.delete('/users/:id', async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if(!user) {
//       return res.status(404).send()
//     }
//     res.send(user)
//   } catch(e) {
//     res.status(500).send(e)
//   }
// })

router.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  // req.user.avatar = req.file.buffer
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if(!user || !user.avatar) {
      throw new Error('User does not exit')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch(e) {
    res.status(404).send({error: e.message})
  }
})

module.exports = router