<template>
    <div>
        <NavBar></NavBar>

        <div>
            <h1 class="name-heading" style="margin-top: 200px;">404 Not Found</h1>
            <h2 class="return-heading">Return to <router-link to="browse">Home</router-link></h2>
        </div>

    </div>
</template>

<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "NotFound",

        components: {
            NavBar
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");
        }
    }
</script>

<style>

    .return-heading {
        font-size: 20pt;
        text-align: center;
        font-family: "Helvetica Neue";
        font-weight: bold;
        margin: auto auto 20px;
    }
</style>