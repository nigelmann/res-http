
const element = document.querySelector('.current-time')

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
