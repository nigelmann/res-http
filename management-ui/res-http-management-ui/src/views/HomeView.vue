<script>
export default {
  data() {
    return {
      containers: []
    }
  },
  methods: {
    startContainer: function (event, containerID) {
      const button = event.target;
      button.disabled = true;
      this.doFetch("http://localhost:3000/start/" + containerID, { "method": "POST" }).then(() => { button.disabled = false; return true; }).catch(() => { button.disabled = false; return false; })
    },
    stopContainer: function (event, containerID) {
      const button = event.target;
      button.disabled = true;
      this.doFetch("http://localhost:3000/stop/" + containerID, { "method": "POST" }).then(() => { button.disabled = false; return true; }).catch(() => { button.disabled = false; return false; })
    },
    doFetch: function (url, params) {
      return fetch(url, params);
    }
  },
  mounted() {
    const refreshContainerData = () => {
      fetch("http://localhost:3000/get-containers", { "method": "POST" })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          this.containers = data.filter((containerInfo) => containerInfo.Names[0].startsWith("/res-http")).filter((value, index, self) => self.map(x => x.Id).indexOf(value.Id) == index);
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          setTimeout(refreshContainerData, 1000);
        });
    }
    refreshContainerData();
  }
}
</script>

<template>
  <main>
    <div class="container mt-5">
      <h1>Containers</h1>
      <div class="row mb-5" v-for="container in containers">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">{{ container.Names[0].replace("/", "") }}</div>
            <div class="card-body">
              <p>
                <strong>Id</strong>
                : {{ container.Id }}
                <br />
                <strong>Image</strong>
                : {{ container.Image }}
                <br />
                <strong>Status</strong>
                : {{ container.Status }}
                <br />
                <strong>Command</strong>:
                <kbd>{{ container.Command }}</kbd>
              </p>
              <!--<p
                class="card-text"
              >With supporting text below as a natural lead-in to additional content.</p>-->
              <button
                @click="stopContainer($event, container.Id)"
                class="btn btn-danger"
                v-if="container.State === 'running'"
              >Stop container</button>
              <button
                @click="startContainer($event, container.Id)"
                class="btn btn-success"
                v-else
              >Start container</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

