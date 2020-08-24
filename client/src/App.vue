<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  import {UserApiClient} from "./Api";

  export default {
    name: 'app',

    mounted: async function () {
      this.api = new UserApiClient("http://localhost:9500/");
    },
  }

</script>
