<template>
    <div>
        <NavBar></NavBar>
        <div class="login-wrapper">
            <section>
                <router-view></router-view>

                <h1 class="login-heading">Login</h1>

                <b-field label="Email" :type="{ 'is-danger': emailErrors.length }" :message="emailErrors">
                    <b-input type="email" v-model="email"></b-input>
                </b-field>

                <b-field label="Password" :type="{ 'is-danger': passwordErrors.length }" :message="passwordErrors">
                    <b-input id="test" type="password" v-model="password" @keyup.native.enter="submit"></b-input>
                </b-field>

                <div class="sign-in-buttons">
                    <b-button v-on:click="register">Register</b-button>
                    <b-button type="is-primary" v-on:click="submit" style="margin-left: 5px">Sign in</b-button>
                </div>

            </section>
        </div>
    </div>
</template>


<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "Login",

        components: {
            NavBar
        },

        mounted: async function() {
            this.api = new UserApiClient("http://localhost:8080/");
        },

        data() {
            return {
                email: "",
                password: "",
                emailErrors: [],
                passwordErrors: []
            }
        },


        methods: {
            /**
             * Checks if the fields are empty
             */
            checkFields() {
                if (this.email.length === 0) {
                    this.emailErrors.push("Email cannot be empty");
                } else {
                    if (!(this.email.includes('@'))) {
                        this.emailErrors.push("Invalid email");
                    }
                }
                if (this.password.length === 0) {
                    this.passwordErrors.push("Password cannot be empty");
                }
            },


            /**
             * Attempts to log the user in by sending the field data
             * Will display errors in the error box if unsuccessful or set the user's token and route to the home page
             * if successful
             */
            async login() {

                let userData = {
                    "email": this.email,
                    "password": this.password
                };

                let response = await this.api.login(userData);
                switch (response.statusText) {
                    case "OK":
                        await this.$router.push({name: "home"});
                        break;

                    case "Bad Request: invalid email/password supplied":
                        this.passwordErrors.push("Invalid email/password");
                        break;

                    case 'Bad Request: data.email should match format "email"':
                        this.emailErrors.push("Invalid Email");
                        break;

                    default:
                        break;
                }

            },

            /**
             * Called when the submit button is pressed
             * Checks the fields are valid and then calls the login method
             */
            submit() {
                this.emailErrors = [];
                this.passwordErrors = [];
                this.checkFields();
                if (this.emailErrors.length === 0 && this.passwordErrors.length === 0) {
                    this.login();
                }
            },


            /**
             * Called when the create account button is pressed
             * Directs the user to the create profile page
             */
            async register() {
                await this.$router.push({name: "register"});
            }

        }
    }
</script>


<style>

    .login-wrapper {
        margin: 15em auto auto;
        width: 30%;
        min-width: 300px;
        max-width: 300px;
    }

    .sign-in-buttons {
        margin: auto auto auto;
        float: right;
    }

    .login-heading {
        font-size: 20pt;
        text-align: left;
        font-family: "Helvetica Neue";
        font-weight: bold;
        margin-bottom: 20px;
    }

</style>
