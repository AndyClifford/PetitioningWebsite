<template>
    <div>
        <NavBar></NavBar>
        <div class="register-wrapper">
            <section>
                <router-view></router-view>

                <h1 class="register-heading">Register</h1>

                <button v-if="hasUploaded" class="photo-del-button" @click="deletePhoto">X</button>

                <div v-if="hasUploaded" class="profile-picture">
                    <div class="image is-128x128" :style="{ 'background-image': `url(${previewImage})` }" @click="selectImage">
                    </div>

                    <b-field label="Upload Profile Picture"></b-field>
                </div>

                <div v-else class="profile-picture">
                    <figure class="image is-128x128" @click="selectImage">
                        <img class="is-rounded" src="../../assets/default-user-profile.jpg">
                    </figure>

                    <b-field label="Upload Profile Picture"></b-field>
                </div>


                <div style="display-model: block; text-align: center; margin-left: 50px;">
                    <input  accept="image/png, image/gif, image/jpeg"
                            ref="fileInput"
                            type="file"
                            @change="pickFile"
                            class="photo-input">
                </div>
                <br/>

                <b-field label="Name" :type="{ 'is-danger': nameErrors.length }" :message="nameErrors">
                    <b-input v-model="name"></b-input>
                </b-field>

                <b-field label="Email" :type="{ 'is-danger': emailErrors.length }" :message="emailErrors">
                    <b-input type="email" v-model="email"></b-input>
                </b-field>

                <b-field label="Password" :type="{ 'is-danger': passwordErrors.length }" :message="passwordErrors">
                    <b-input type="password" v-model="password"></b-input>
                </b-field>

                <b-field label="City (optional)">
                    <b-input v-model="city"></b-input>
                </b-field>

                <b-field label="Country (optional)">
                    <b-input v-model="country"></b-input>
                </b-field>

                <div class="register-buttons">
                    <b-button v-on:click="login">Cancel</b-button>
                    <b-button type="is-primary" v-on:click="submit" style="margin-left: 5px">Register</b-button>
                </div>

            </section>
        </div>
    </div>
</template>


<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "Register",

        components: {
            NavBar
        },

        mounted: async function() {
            this.api = new UserApiClient("http://localhost:8080/");
        },

        data() {
            return {
                file: null,
                previewImage: "",
                hasUploaded: false,
                name: "",
                email: "",
                password: "",
                city: "",
                country: "",
                nameErrors: [],
                emailErrors: [],
                passwordErrors: []
            }
        },


        methods: {
            /**
             * Checks if the fields are empty
             */
            checkFields() {
                if (this.name.length === 0) {
                    this.nameErrors.push("Name cannot be empty");
                }

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


            selectImage() {
                this.$refs.fileInput.click();
            },

            pickFile() {
                let input = this.$refs.fileInput;
                let file = input.files;
                if (file && file[0]) {
                    this.hasUploaded = true;
                    let reader = new FileReader;
                    reader.onload = e => {
                        this.previewImage = e.target.result;
                        console.log(this.previewImage);
                    };
                    this.file = file[0];
                    reader.readAsDataURL(file[0]);
                    this.$emit('input', file[0]);
                }
            },

            async deletePhoto() {
                this.previewImage = "";
                this.file = null;
                this.hasUploaded = false;
                this.$refs.fileInput.value = '';
            },


            /**
             * Attempts to log the user in by sending the field data
             * Will display errors in the error box if unsuccessful or set the user's token and route to the home page
             * if successful
             */
            async register() {
                let userData = {
                    "name": this.name,
                    "email": this.email,
                    "password": this.password
                };

                if (this.city !== "") {
                    userData["city"] = this.city;
                }

                if (this.country !== "") {
                    userData["country"] = this.country;
                }

                let response = await this.api.register(userData);
                switch (response.statusText) {
                    case "Created":
                        // eslint-disable-next-line no-case-declarations
                        let loginResponse = await this.api.login(userData);
                        sessionStorage.setItem("token", loginResponse.data.token);

                        //Upload the profile picture if there was one
                        if (this.file) { //A photo has been selected
                            await this.api.uploadUserPhoto(response.data["userId"], this.file);
                        }

                        await this.$router.push({name: "home"});
                        break;

                    case "Bad Request: email already in use":
                        this.emailErrors.push("Email address already in use");
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
                this.nameErrors = [];
                this.emailErrors = [];
                this.passwordErrors = [];
                this.checkFields();
                if (this.nameErrors.length === 0 && this.emailErrors.length === 0 && this.passwordErrors.length === 0) {
                    this.register();
                }
            },

            async login() {
                await this.$router.push({name: "login"});
            }

        }
    }
</script>


<style>

    .register-wrapper {
        margin: 5em auto auto;
        width: 30%;
        min-width: 400px;
        max-width: 400px;
    }

    .register-buttons {
        margin: auto auto auto;
        float: right;
    }

    .image.is-128x128 {
        border-radius: 50%;
        display: block;
        cursor: pointer;
        margin: 0 auto 10px;
        background-size: cover;
        background-position: center center;
    }

    .profile-picture {
        text-align: center;
    }

    .photo-del-button {
        float: right;
        margin-right: 120px;
    }

    .photo-input {
        margin-left: 30px;
    }

    .register-heading {
        font-size: 20pt;
        text-align: center;
        font-family: "Helvetica Neue";
        font-weight: bold;
        margin-bottom: 20px;
    }

</style>
