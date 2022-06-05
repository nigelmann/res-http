# HTTP

## Step 1 (Static HTTP server with apache httpd)
> All the files related to the static http server are in the `static` directory.

To run the static http server go into the directory and run `docker-compose up`. Then you can acces the web page [here](http://localhost:8080)

The apache configuration file is at `static/statichttpd.conf` and is copied in the container at build time. We just added 

```apache
<VirtualHost *:80>
    PassEnv HOSTNAME
    Header set X-Hostname "%{HOSTNAME}e"
</VirtualHost>
```

To add a header to know whitch server responded.

NOTE:
- This project was modified after to match requirements for other steps, The added javascript is present and the ajax request receives a 404 when the dynamic server is not running but this only happens once.
- The image sources need to be adapted if the webpage is acces simply with the static server or via a reverse proxy we choose to add a little bit of javacript to change the image source if it is not found. This is not ideal since an extra request needs to be made but in a real world situation we would handle this with some backend code. Here is an example `<img style="min-width: 2em;" src="./images/heig-logo.svg" onerror="this.src='/static/images/heig-logo.svg'" alt="">`. Also in the eventuality that the second URL is not found we would have a loop of requests.

## Step 2 (Dynamic HTTP server with express.js)
> All the files related to the dynamic server are in the `dynamic` directory

To run the static http server go into the directory and run `docker-compose up` then you can acces the web page [here](http://localhost:8080)

The Dynamic server has 3 possible URLs
- ["/"](http://localhost:8080/) This route returns a "Hello World!" message
- ["/now"](http://localhost:8080/now) This route was added in step 4 and in the returned JSON there is a key `now` that contains the time of the server
- ["/{name}"](http://localhost:8080) This route returns a message "Hello {name}" where name is the string passed in the URL

All the routes also return the hostname in their respective JSON responses. The key is `hostname`, This was added to help us identify witch instance was returning the response for the load balancing with sticky session vs round-robin

## Step 3 (Reverse proxy with apache (static configuration))
> All the files related to the dynamic server are in the `apache-revese-proxy` directory

To run the static http server go into the directory and run `docker-compose up` then you can acces the web pages can be accesed here
- [static](http://localhost:8080/static)
- [dynamic](http://localhost:8080/dynamic)

The apache configuration file is at `dynamic/my-httpd.conf` and is copied in the container at build time.

The important part of it is at the end

```apache
<VirtualHost *:80>
    <Directory />
        Deny From All
    </Directory>
    ProxyPass "/static" "http://static:80"
    ProxyPassReverse "/static" "http://static:80"
    ProxyPass "/dynamic" "http://dynamic:3000"
    ProxyPassReverse "/dynamic" "http://dynamic:3000"
</VirtualHost>
```

In this part we configure the reverse-proxy itself. The `ProxyPass $1 $2` indicates that request starting with `$1` must be forwarded to `$2` and remove the prefix. The `ProxyPassReverse $1 $2` idicates that when the proxy recived a response from the forwarded request it must re add the prefix to the header.

The `<Directory />` directive is here to Deny acces to the `http://localhost/` since no service is configured there.

The following lines (142 & 145) were uncommented to enable the `mod_proxy` & `mod_proxy_http` modules.

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so``
```

## Step 4 (AJAX requests with JQuery)
This step does not have a seperate directory for all the files since we had to modify steps 1 and 2.

In the step 1 we added a JavaScript file `static/public/js/main.js`.

```js 
const interval = window.setInterval(() => {
    fetch('/dynamic/now/')
        .then((response) => {
            return response.JSON()
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
```
This simple JS code makes a request every 2 seconds to the dynamic server to ask for the current time. It then updates the DOM to display the time in a human readable format.
We use the fetch API to make requests as, for what we do here, it essentialy does the same thing as jQuery's AJAX features, but with a lot less overhead.

We added the route `/now` to the dynamic server. It simply adds the current server time to the returned JSON
```js
app.get('/now', (req, res) => {
    res.setHeader('Content-Type', 'application/JSON');
    res.send(JSON.stringify({now: Date.now(), hostname: os.hostname()}))
})
```

The use of a reverse proxy is great in terms of security because we only expose one server to the internet (generally in the DMZ) and then the reverse proxy itself has access to all the services 
(and their replicas). This creates a bottleneck which is positive in terms of security, as it allows to easily add a firewall and/or a WAF in between the DMZ and the LAN.
This however, means that the reverse proxy alone can bring an entire service down if it stops working. Although very rare because of the light workloads these appliance receive (basically forward UDP packets), it's a risk that needs to be take into account.

## Step 5 (Dynamic reverse proxy configuration)
To create a dynamic reverse-proxy infrastructure, we decided to use [traefik](https://traefik.io/)

To run the traefik reverse proxy simply run `docker-compose up` in the root directory.

To have traefik handle every thing for use we added the `traefik:v2.6` as a service in our `docker-compose.yml` file and only this service is exposed. Then for the other services we added some labels so that traefik can autodiscover those services.

With the `traefik.http.routers.{service}.rule=PathPrefix({prefix})` label we define a rule to inform traefik that all URLs starting with `prefix` must be redirected to this container.

With the `traefik.http.routers.{service}.middlewares={middleware name}` label we define a middleware for our container. A middleware is like a function to modify the request before it is sent to our container.

With the `traefik.http.middlewares.{middleware name}.stripprefix.prefixes=/prefix` label we define how we want to modify our request in the middleware defined just before, Here we remove a prefix.

With the `traefik.http.services.static.loadbalancer.server.port=80` label we define witch port has be use on the container by the load balancer.

By using traefik we can also easily scale our infrastructure at startup by defining for any service a number of replicas and there will be auto-discovered by traefik and automaticaly load balanced using the round-robin algorithm. To do just that we add this to a service in our `docker-compose.yml`

```yaml
deploy:
  replicas: {number os instances}
```

## Additional steps

#### Load balancing: multiple server nodes
Since we used traefik in step 5 this was already done

#### Load balancing: round-robin vs sticky sessions
To handle different load balancing configuration traefik makes it really easy for us. By default the load balancer uses the round-robin algorithm so we just needed to add some configuration for the static server be load balanced with a sticky session. We added the `traefik.http.services.{service}.loadbalancer.sticky.cookie.name=session` label to our container. This was traefik knows it must use a sticky session strategy and it adds a cookie (named `session`) to keep track of whitch client has accessed whitch instance.

To test this we added the server host same in the response of the dynamic server and for the static server we display the server name (container id) on the page directly this way we were able to easyly test that everything was working according to planned.

#### Dynamic cluster management
For this step we discovered there was a difference between docker-composer version 1 and version 2.

We both use version 2 so this was not a probleme.

In our final `docker-compose.yml` we have one instance of each service. To be able to scale our infrastructure we need to start docker-compose in detached mode.

To do this we run `docker-compose up -d` 

Then if we want to scal any of our services we simply run `docker-compose up -d --scale {service}={number of instances} --no-recreate`  
`{service}` beeing the name of the service defined in the `docker-compose.yml`, we also use the `--no-recreate` flag to avoid creating containers if it is not needed.

#### Management UI
To be able to manage our infrastructure with a user interface we created a simple web application with express and [Vue.js](https://vuejs.org/)

> All the files related to the management ui are in the `management-ui` directory.

We used the [dockerode](https://www.npmjs.com/package/dockerode) npm package to interact with docker. Dockerode need to acces the docker socket on our machine so in the `docker-compose.yml` we added a shared volume.

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

> __A note on sharing the docker socket__  
> 
> While being the only way to handle this properly, sharing the docker socket in a container gives it full access to the docker engine host machine. This needs to be taken into account when deploying a large-scale infrastructure in a profesionnal environment.  
> A simple-way to avoid this is to run docker in a docker container (could be called `docker-ception` :P), this allows to isolate the risk of sharing the docker socket. This also opens the possibility of hosting the management UI on the same "host" as the one managing the other containers, giving is a much wider range of controls.



For the front-end of our management ui we used VueJS because it's easy to bootstrap for small projects like this one. The vue project can be found in `management-ui/res-http-management-ui` We have one simple page that fetches all the containers with an AJAX call to the express backend. Then we filter them to only have the ones from our current project. They are then displayed and we can start and stop them by clicking. Witch makes another AJAX call.

This solution does not allow us to scale our infrastructure with the ui. However if we want to be able to fake scaling we can start the infrastructure with for exaple 10 replicas of the services and then start/stop some isntance when needed.

