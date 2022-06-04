var Docker = require("dockerode");
const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "res-http-management-ui/dist")));

app.post("/get-containers", (req, res) => {
    const docker = new Docker();
    const containers = [];
    docker.listContainers({all: true},function (err, containers) {
        containers.forEach(function (containerInfo) {
            containers.push(containerInfo);
        });
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(containers));
    });
});

app.post("/start/:id", (req, res) => {
    const docker = new Docker();
    const container = docker.getContainer(req.params.id);
    container.start();
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true }));
});

app.post("/stop/:id", (req, res) => {
    const docker = new Docker();
    const container = docker.getContainer(req.params.id);
    container.stop();
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ success: true }));
});

app.listen(port, () => {
    console.log(`Managment ui api ${port}`)
});
