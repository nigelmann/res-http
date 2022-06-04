const element = document.querySelector('.current-time')
const serverElement = document.querySelector('#current-server')

document.addEventListener('DOMContentLoaded', () => {
    const req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    serverElement.innerText = req.getResponseHeader("x-hostname");
})

const interval = window.setInterval(() => {
    fetch('/dynamic/now/')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            let d = new Date(data.now)
            element.innerText = d.toLocaleString()
        })
        .catch(error => {
            element.innerText = "not known (server could not be reached, are you sure the dynamic server is running ?)"
            clearInterval(interval)
        })
}, 2000)
