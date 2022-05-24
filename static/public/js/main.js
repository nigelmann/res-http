const element = document.querySelector('.current-time')

document.addEventListener('DOMContentLoaded', () => {
    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    var headers = req.getAllResponseHeaders().toLowerCase();
    console.log(headers);
})

window.setInterval(() => {
    fetch('/dynamic/now/')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            let d = new Date(data.now)
            element.innerText = d.toLocaleString()
        })
        .catch(error => {
            console.log(error)
        })
}, 2000)
