const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
  useNewUrlParser: true,
  useCreateIndex: true
})



// const me = new User({
//   name: 'Tao Gao',
//   password: '        1234Nodejs',
//   email: 'tao.gao@oracle.com',
//   age: 30
// })

// me.save().then((result) => {
//   console.log(result)
// }).catch((error) => {
//   console.log(error)
// })


// const task = new Task({
//   description: "SQL Tuning",
//   //completed: false
// })

// task.save().then(() => {
//   console.log(task)
// }).catch((error) => {
//   console.log(error)
// })
