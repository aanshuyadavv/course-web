const express = require('express')
const app = express()
const db = require("./config/mongoose-connection")
const port = 3000

db()

app.get('/', (req, res) => {
  res.send('Hello World!')
//   console.log(process.env.NODE_ENV)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})