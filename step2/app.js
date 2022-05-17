const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({message: 'Hello World!'}))
})

app.get('/now', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({now: Date.now()}))
})

app.get('/:name', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({message: `Hello ${req.params.name}`}))
})

app.listen(port, () => {
    console.log(`Dynamic app listening on port ${port}`)
})
