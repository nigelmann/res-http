const express = require('express')
const os = require("os");
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({message: 'Hello World!', hostname: os.hostname()}))
})

app.get('/now', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({now: Date.now(), hostname: os.hostname()}))
})

app.get('/:name', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({message: `Hello ${req.params.name}`, hostname: os.hostname()}))
})

app.listen(port, () => {
    console.log(`Dynamic app listening on port ${port}`)
})
