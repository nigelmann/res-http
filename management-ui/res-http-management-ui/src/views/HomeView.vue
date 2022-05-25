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
    },
    getLabelsString: function (labelsArray) {
      return Object.keys(labelsArray).map(key => `<strong>${key}</strong> => ${labelsArray[key]}`).join('<br>')
    },
    getMountsString: function (mountsArray) {
      let string = "";
      let i = 0;
      for (const mount of mountsArray) {
        string += `<h3>#${i++}</h3>` + Object.keys(mount).map(key => `<strong>${key}</strong> => ${mount[key]}`).join('<br>') + "<hr>";
      }

      // Removing last <hr>, yes I'm a lazy wanker
      string = string.slice(0, -4);
      return string;
    },
    getPortsMapping: function (portsMappingArray) {

      let string = "";
      let i = 0;
      for (const portMapping of portsMappingArray) {
        string += `<h3>#${i++}</h3>` + Object.keys(portMapping).map(key => `<strong>${key}</strong> => ${portMapping[key]}`).join('<br>') + "<hr>";
      }

      // Removing last <hr>, yes I'm a lazy wanker again
      string = string.slice(0, -4);
      return string;
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
      <hr />
      <p>
        On this page you can view the containers that have been run at least once (and not removed!) for the "res-http" project.
        You may stop or start them.
        <br />Due to the limitations of the docker socket API without using swarms, containers cannot be scaled (there is no API for docker-compose!)
      </p>
      <p>
        Scaling can be done easily on the host running docker with a command like this one
        <br />
        <kbd>docker-compose up -d --scale static=5 --no-recreate</kbd> or
        <kbd>docker-compose up -d --scale dynamic=5 --no-recreate</kbd>
      </p>
      <p>This page refreshes data automatically, so if you scale the infrastructure, no need to restart or even refresh the management page.</p>
      <hr />
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
                <br />
                <strong>Mounts count</strong>
                :
                {{ container.Mounts?.length ?? 0 }}
                <br />
                <strong>Ports mapping (IPv4 & IPv6 included)</strong>
                :
                {{ container.Ports?.length ?? 0 }}
              </p>
              <div
                class="alert alert-danger"
                v-if="container.Names[0].includes('management')"
                role="alert"
              >Warning: This is the management container. If you stop it, the management console will stop responding, use with caution.</div>
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
              &nbsp;&nbsp;
              <button
                class="btn btn-info"
                @click="this.$swal({ width: '90%', html: this.getLabelsString(container.Labels) })"
              >Show container labels</button>
              &nbsp;&nbsp;
              <button
                class="btn btn-info"
                @click="this.$swal({ width: '90%', html: this.getMountsString(container.Mounts) })"
                v-if="container.Mounts.length > 0"
              >Show mounts</button>
              &nbsp;&nbsp;
              <button
                class="btn btn-info"
                @click="this.$swal({ width: '90%', html: this.getPortsMapping(container.Ports) })"
                v-if="container.Ports.length > 0"
              >Show ports mapping</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.swal2-html-container {
  text-align: left !important;
}
.swal2-actions {
  justify-content: flex-end !important;
  width: 98% !important;
}
</style>
