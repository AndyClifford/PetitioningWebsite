<template>
    <div>
        <NavBar></NavBar>

        <div>
            <h1 class="name-heading" style="margin-top: 200px;">403 Forbidden</h1>
            <h2 class="return-heading">Return to <router-link to="browse">Home</router-link></h2>
        </div>
    </div>
</template>

<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "Forbidden",

        components: {
            NavBar
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");
        }
    }
</script>