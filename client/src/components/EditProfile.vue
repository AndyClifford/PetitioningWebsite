<template>
    <div>
        <NavBar></NavBar>
        <div class="edit-wrapper">

            <h1 class="petition-heading">Account Settings</h1>
            <section>
                <b-tabs position="is-centered" class="block">
                    <b-tab-item label="General Information">
                        <div class="update-wrapper">
                            <section>
                                <router-view></router-view>

                                <button v-if="hasPhoto || hasUploaded" class="photo-del-button" @click="deletePhoto">X</button>

                                <div class="profile-picture">
                                    <div v-if="hasUploaded" class="image is-128x128" :style="{ 'background-image': `url(${previewImage})` }" @click="selectImage">
                                    </div>

                                    <div v-else-if="hasPhoto" class="image is-128x128" :style="{ 'background-image': `url(http://localhost:4941/api/v1/users/${this.$route.params.id}/photo)` }" @click="selectImage">
                                    </div>

                                    <figure v-else class="image is-128x128" @click="selectImage">
                                        <img class="is-rounded" src="../../assets/default-user-profile.jpg">
                                    </figure>

                                    <b-field label="Upload Profile Picture"></b-field>
                                </div>

                                <div style="display-model: block; text-align: center; margin-left: 50px;">
                                    <input  accept="image/png, image/gif, image/jpg"
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

                                <b-field label="City" :type="{ 'is-danger': cityErrors.length }" :message="cityErrors">
                                    <b-input v-model="city"></b-input>
                                </b-field>

                                <b-field label="Country" :type="{ 'is-danger': countryErrors.length }" :message="countryErrors">
                                    <b-input v-model="country"></b-input>
                                </b-field>

                                <div class="register-buttons">
                                    <b-button v-on:click="cancel">Cancel</b-button>
                                    <b-button type="is-primary" v-on:click="submitGeneral" style="margin-left: 5px">Save</b-button>
                                </div>

                            </section>
                        </div>
                    </b-tab-item>
                    <b-tab-item label="Change Password">
                        <div class="update-wrapper">
                            <section>
                                <router-view></router-view>

                                <b-field label="Old Password" :type="{ 'is-danger': oldPasswordErrors.length }" :message="oldPasswordErrors">
                                    <b-input type="password" v-model="oldPassword"></b-input>
                                </b-field>

                                <b-field label="New Password" :type="{ 'is-danger': newPasswordErrors.length }" :message="newPasswordErrors">
                                    <b-input type="password" v-model="newPassword"></b-input>
                                </b-field>

                                <b-field label="Confirm Password" :type="{ 'is-danger': confirmPasswordErrors.length }" :message="confirmPasswordErrors">
                                    <b-input type="password" @keyup.native.enter="submitPassword" v-model="confirmPassword"></b-input>
                                </b-field>

                                <div class="register-buttons">
                                    <b-button v-on:click="cancel">Cancel</b-button>
                                    <b-button type="is-primary" v-on:click="submitPassword" style="margin-left: 5px">Confirm</b-button>
                                </div>

                            </section>
                        </div>
                    </b-tab-item>
                </b-tabs>

            </section>
        </div>
    </div>
</template>

<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "EditProfile",

        components: {
            NavBar
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");

            this.userResponse = await this.api.getUserData(sessionStorage.getItem("userId"));
            let photoResponse;
            switch (this.userResponse.statusText) {
                case "OK":
                    photoResponse = await this.api.getUserPhoto(this.$route.params.id);
                    this.hasPhoto = photoResponse.statusText === "OK";
                    this.updateData(this.userResponse.data);
                    break;

                case "Not Found":
                    await this.$router.push({name: "notFound"});
            }

        },

        data() {
            return {
                userResponse: null,
                file: null,
                previewImage: "",
                hasUploaded: false,
                hasPhoto: false,
                hasDeleted: false,
                name: "",
                email: "",
                password: "",
                city: "",
                country: "",
                nameErrors: [],
                emailErrors: [],
                cityErrors: [],
                countryErrors: [],

                oldPassword: "",
                oldPasswordErrors: [],
                newPassword: "",
                newPasswordErrors: [],
                confirmPassword: "",
                confirmPasswordErrors: [],
            }
        },

        methods: {
            /**
             * Checks if the fields are empty etc
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

                if (this.city.length === 0 && this.userResponse.data.city.length !== 0) {
                    this.cityErrors.push("You may not remove city")
                }

                if (this.country.length === 0 && this.userResponse.data.country.length !== 0) {
                    this.countryErrors.push("You may not remove country")
                }

            },

            checkPasswordFields() {
                if (this.oldPassword === "") {
                    this.oldPasswordErrors.push("Please enter this field");
                }

                if (this.newPassword === "") {
                    this.newPasswordErrors.push("Please enter this field");
                }

                if (this.confirmPassword === "") {
                    this.confirmPasswordErrors.push("Please enter this field")
                }

                if (this.newPassword !== "" && this.confirmPassword !== "") {
                    if (this.newPassword !== this.confirmPassword) {
                        this.confirmPasswordErrors.push("Passwords don't match!");
                    }
                }
            },

            updateData(userData) {
                this.name = userData.name;
                this.email = userData.email;
                this.city = userData.city;
                this.country = userData.country;
            },


            selectImage() {
                this.$refs.fileInput.click();
            },

            pickFile() {
                let input = this.$refs.fileInput;
                let file = input.files;
                if (file && file[0]) {
                    this.hasUploaded = true;
                    this.hasDeleted = false;
                    let reader = new FileReader;
                    reader.onload = e => {
                        this.previewImage = e.target.result;
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
                if (this.hasPhoto) {
                    this.hasDeleted = true;
                    this.hasPhoto = false;
                }
                this.$refs.fileInput.value = '';
            },

            alert(text) {
                this.$buefy.dialog.alert(text);
            },

            async updateUser() {
                let userData = {
                    "name": this.name,
                    "email": this.email
                };

                if (this.city !== "") {
                    userData["city"] = this.city;
                }

                if (this.country !== "") {
                    userData["country"] = this.country;
                }

                let response = await this.api.updateUserData(this.$route.params.id, userData);
                switch (response.statusText) {
                    case "OK":
                        // eslint-disable-next-line no-case-declarations
                        //Upload the profile picture if there was one
                        if (this.file) { //A photo has been selected
                            await this.api.uploadUserPhoto(this.$route.params.id, this.file);
                        }

                        if (this.hasDeleted) {
                            await this.api.deleteUserPhoto(this.$route.params.id);
                        }

                        //Show dialog of confirmed update
                        this.alert("Update successful");
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

            async updatePassword() {
                let updateData = {
                    "currentPassword": this.oldPassword,
                    "password": this.newPassword
                };

                let response = await this.api.updateUserData(this.$route.params.id, updateData);
                switch (response.statusText) {
                    case "OK":
                        this.oldPassword = "";
                        this.newPassword = "";
                        this.confirmPassword = "";
                        this.alert("Successfully changed password");
                        break;

                    case "Bad Request: incorrect password":
                        //Incorrect password
                        this.oldPasswordErrors.push("Incorrect password");
                        break;

                    default:
                        break;
                }
            },

            /**
             * Called when the submit button is pressed
             * Checks the fields are valid and then calls the login method
             */
            submitGeneral() {
                this.nameErrors = [];
                this.emailErrors = [];
                this.cityErrors = [];
                this.countryErrors = [];
                this.checkFields();
                if (this.nameErrors.length === 0 && this.emailErrors.length === 0 && this.cityErrors.length === 0 && this.countryErrors.length === 0) {
                    this.updateUser();
                }
            },

            /**
             * Called when the submit button is pressed
             * Checks the fields are valid and then calls the login method
             */
            submitPassword() {
                this.oldPasswordErrors = [];
                this.newPasswordErrors = [];
                this.confirmPasswordErrors = [];
                this.checkPasswordFields();
                if (this.oldPasswordErrors.length === 0 && this.newPasswordErrors.length === 0 && this.confirmPasswordErrors.length === 0) {
                    this.updatePassword();
                }
            },

            async cancel() {
                await this.$router.push({name: "myProfile"});
            }
        }
    }
</script>

<style>

    .edit-wrapper {
        margin: 3em auto 100px;
        width: 1300px;
        min-height: 360px;
    }

    .update-wrapper {
        margin: 3em auto auto;
        width: 30%;
        min-width: 400px;
        max-width: 400px;
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

</style>