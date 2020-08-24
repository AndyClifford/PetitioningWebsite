<template>
    <div class="navbar-wrapper">
        <b-navbar>
            <template slot="brand">
                <b-navbar-item tag="router-link" :to="{ name: 'home' }">
<!--                    <img-->
<!--                            src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"-->
<!--                            alt="Lightweight UI components for Vue.js based on Bulma">-->
                    <img
                            src="../../assets/Logo.png"
                            alt="Lightweight UI components for Vue.js based on Bulma">
                </b-navbar-item>
            </template>
            <template slot="start">
                <b-navbar-item @click="startPetition">
                    Start a Petition
                </b-navbar-item>
                <b-navbar-item @click="myProfile">
                    My Petitions
                </b-navbar-item>

            </template>


            <template slot="end">

                <b-dropdown class="dropdown" hoverable aria-role="list" v-if="isLoggedIn" style="margin-right: 25px;">
                    <button class="button is-info" slot="trigger">
                        <span>Hi, {{ name }}</span>
<!--                        <b-icon icon="menu-down"></b-icon>-->
                    </button>

                    <b-dropdown-item aria-role="listitem" @click="myProfile">My Petitions</b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" @click="editProfile">Settings</b-dropdown-item>
                    <b-dropdown-item aria-role="listitem" @click="logout">Logout</b-dropdown-item>
                </b-dropdown>

                <b-navbar-item v-if="!isLoggedIn" tag="router-link" :to="{ path: '/register'}">
                    <b-button type="is-primary">Register</b-button>
                </b-navbar-item>

                <b-navbar-item v-if="!isLoggedIn" tag="router-link" :to="{ path: '/login'}">
                    <b-button type="is-light">Sign in</b-button>
                </b-navbar-item>
            </template>
        </b-navbar>
    </div>
</template>

<script>
    import {UserApiClient} from "../Api";

    export default {

        mounted: async function() {
            this.api = new UserApiClient("http://localhost:8080/");
            this.isLoggedIn = sessionStorage.getItem("token") !== null;
            if (this.isLoggedIn) {
                //Get the username
                let userResponse = await this.api.getUserData(sessionStorage.getItem("userId"));
                this.name = userResponse.data.name;
            }
        },

        data() {
            return {
                isLoggedIn: false,
                name: ""
            }
        },

        methods: {
            async logout() {
                let logoutResponse = await this.api.logout();
                switch (logoutResponse.statusText) {
                    case "OK":
                        this.isLoggedIn = false;
                        await this.$router.push({name: "home"}).catch(err => {
                            if (err.name !== "NavigationDuplicated") {
                                // But print any other errors to the console
                                console.error(err);
                            }
                        });
                        break;

                    case "Unauthorized":
                        break;

                    default:
                        break;
                }
                this.isLoggedIn = false;
            },

            async myProfile() {
                if (sessionStorage.getItem("userId")) {
                    await this.$router.push({name: "myProfile", params: {id: sessionStorage.getItem("userId")}}).catch(err => {
                        if (err.name !== "NavigationDuplicated") {
                            // But print any other errors to the console
                            console.error(err);
                        }
                    });
                } else {
                    await this.$router.push({name: "login"});
                }
            },

            goToHome() {
                this.$router.push({name: "home"}).catch(err => {
                    if (err.name !== "NavigationDuplicated") {
                        // But print any other errors to the console
                        console.error(err);
                    }
                });
            },

            async editProfile() {
                await this.$router.push({name: "editProfile", params: {id: sessionStorage.getItem("userId")}}).catch(err => {
                    if (err.name !== "NavigationDuplicated") {
                        // But print any other errors to the console
                        console.error(err);
                    }
                });
            },

            async startPetition() {
                await this.$router.push({name: "startPetition", params: {id: sessionStorage.getItem("userId")}}).catch(err => {
                    if (err.name !== "NavigationDuplicated") {
                        // But print any other errors to the console
                        console.error(err);
                    }
                });
            }

        }
    }
</script>

<style>
    .navbar-wrapper {
        margin: 15px 250px 10px;
    }

    .dropdown {
        margin: 8px 2px 10px;
    }
</style>