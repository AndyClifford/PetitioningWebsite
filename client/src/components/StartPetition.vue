<template>
    <div>
        <NavBar></NavBar>
        <div class="start-petition-wrapper">
            <section>
                <router-view></router-view>

                <h1 class="petition-heading">Start a Petition</h1>

                <div v-if="hasUploaded" class="profile-picture">
<!--                    <img @click="selectImage" src="../../assets/petition_3.jpg" style="max-width: 600px; max-height: 300px;">-->
                    <div class="image is-3by2" :style="{ 'background-image': `url(${previewImage})` }" @click="selectImage">
                    </div>
                    <b-field label="Choose Hero Image" :type="{ 'is-danger': photoErrors.length }" :message="photoErrors"></b-field>
                </div>

                <div v-else class="profile-picture">
                    <b-field label="Choose Hero Image" :type="{ 'is-danger': photoErrors.length }" :message="photoErrors"></b-field>
                </div>

                <div style="display-model: block; text-align: center; margin-left: 50px;">
                    <input  accept="image/png, image/gif, image/jpg"
                            ref="fileInput"
                            type="file"
                            @change="pickFile"
                            class="photo-input">
                </div>
                <br/>

                <b-field label="Title" :type="{ 'is-danger': titleErrors.length }" :message="titleErrors">
                    <b-input placeholder="Enter a title..." v-model="title" required></b-input>
                </b-field>

                <b-field label="Description" :type="{ 'is-danger': descriptionErrors.length }" :message="descriptionErrors">
                    <b-input placeholder="Enter a description..." v-model="description" type="textarea"></b-input>
                </b-field>

                <b-field label="Category">
                    <b-select placeholder="Select a Category" v-model="categoryId" required>
                        <option v-for="category in categories" v-bind:key="category.categoryId" :value="category.categoryId">{{ category.name }}</option>
                    </b-select>
                </b-field>

                <b-field label="Closing Date (optional)" style="width: 250px;" :type="{ 'is-danger': closingDateErrors.length }" :message="closingDateErrors">
                    <b-datetimepicker v-model="closingDate"
                            rounded
                            placeholder="Click to select..."
                            icon="calendar-today"
                            :min-datetime="new Date()"
                            :datepicker="{ showWeekNumber }"
                            :timepicker="{ enableSeconds, hourFormat: format }">
                    </b-datetimepicker>
                </b-field>

                <div class="register-buttons">
                    <b-button v-on:click="cancelCreate">Cancel</b-button>
                    <b-button type="is-primary" v-on:click="submit" style="margin-left: 5px">Create</b-button>
                </div>

            </section>
        </div>
    </div>
</template>


<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "StartPetition",

        components: {
            NavBar
        },

        mounted: async function() {
            this.api = new UserApiClient("http://localhost:8080/");
            let categoryResponse = await this.api.getCategories();
            this.updateCategories(categoryResponse.data);
        },

        data() {
            return {
                file: null,
                previewImage: "",
                hasUploaded: false,
                title: "",
                description: "",
                categoryId: null,
                categories: [],
                closingDate: null,
                photoErrors: [],
                titleErrors: [],
                descriptionErrors: [],
                categoryErrors: [],
                closingDateErrors: [],
                showWeekNumber: true,
                enableSeconds: false,
                format: "24"
            }
        },


        methods: {
            /**
             * Checks if the fields are empty
             */
            checkFields() {
                this.photoErrors = [];
                this.titleErrors = [];
                this.descriptionErrors = [];
                this.categoryErrors = [];
                this.closingDateErrors = [];

                if (!this.hasUploaded) {
                    this.photoErrors.push("Please provide a hero image");
                }

                if (this.title.length === 0) {
                    this.titleErrors.push("Please enter a title");
                }

                if (this.description.length === 0) {
                    this.descriptionErrors.push("Please enter a description");
                }

                if (this.categoryId === null) {
                    this.categoryErrors.push("Please choose a category");
                }

                if (this.closingDate) {
                    if (this.closingDate < Date.now()) {
                        this.closingDateErrors.push("Closing date must be in the future");
                    }
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
                    this.photoErrors = [];
                    let reader = new FileReader;
                    reader.onload = e => {
                        this.previewImage = e.target.result;
                    }
                    this.file = file[0];
                    reader.readAsDataURL(file[0]);
                    this.$emit('input', file[0]);
                }
            },

            /**
             * Attempts to create the petition in by sending the field data
             * Will display errors in the error box if unsuccessful
             */
            async createPetition() {
                let petitionData = {
                    "title": this.title,
                    "description": this.description,
                    "categoryId": this.categoryId,
                };

                if (this.closingDate) {
                    petitionData["closingDate"] = this.closingDate.getFullYear() + "-" + (this.closingDate.getMonth() + 1) + "-" + this.closingDate.getDate() + " " + this.closingDate.toLocaleTimeString()
                }

                let response = await this.api.createPetition(petitionData);
                await this.api.uploadPetitionPhoto(response.data["petitionId"], this.file);
                await this.api.signPetition(response.data["petitionId"]);
                await this.$router.push({name: "viewPetition", params: {id: response.data["petitionId"]}});
            },

            updateCategories(categoryData) {
                this.categories = [];
                for (let i = 0; i < categoryData.length; i++) {
                    this.categories.push(categoryData[i]);
                }
            },

            /**
             * Called when the submit button is pressed
             * Checks the fields are valid and then calls the login method
             */
            submit() {
                this.checkFields();
                if (this.photoErrors.length === 0 && this.titleErrors.length === 0 && this.descriptionErrors.length === 0 && this.categoryErrors.length === 0 && this.closingDateErrors.length === 0) {
                    this.createPetition();
                }
            },

            async cancelCreate() {
                await this.$router.push({name: "login"});
            }

        }
    }
</script>


<style>

    .register-buttons {
        margin: auto auto auto;
        float: right;
    }

    .start-petition-wrapper {
        margin: 3em auto 200px;
        width: 550px;
        min-height: 360px;
    }

    .petition-heading {
        font-size: 40pt;
        text-align: center;
        font-family: "Helvetica Neue";
        font-weight: bold;
        margin-bottom: 20px;
    }

    .image.is-3by2 {
        display: block;
        margin: auto;
    }

    .image.is-128x128 {
        display: block;
        cursor: pointer;
        margin: 0 auto 10px;
        background-size: cover;
        background-position: center center;
    }

    .profile-picture {
        text-align: center;
    }

    .photo-input {
        margin-left: 30px;
    }

</style>
