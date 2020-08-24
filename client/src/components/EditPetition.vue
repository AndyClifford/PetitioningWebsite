<template>
    <div>
        <NavBar></NavBar>
        <div class="start-petition-wrapper">
            <section>
                <router-view></router-view>

                <h1 class="petition-heading">Manage Petition</h1>

                <div v-if="hasUploaded" class="profile-picture">
                    <div class="image is-3by2" :style="{ 'background-image': `url(${previewImage})` }" @click="selectImage">
                    </div>
                    <b-field label="Choose Hero Image"></b-field>
                </div>

                <div v-else class="profile-picture">
                    <img @click="selectImage" :src="`http://localhost:4941/api/v1/petitions/${this.$route.params.id}/photo`" style="max-width: 600px; max-height: 300px;">
                    <b-field label="Choose Hero Image"></b-field>
                </div>

                <div style="display-model: block; text-align: center; margin-left: 50px;">
                    <input  :disabled="petitionIsClosed" accept="image/png, image/gif, image/jpg"
                            ref="fileInput"
                            type="file"
                            @change="pickFile"
                            class="photo-input">
                </div>
                <br/>

                <b-field label="Title" :type="{ 'is-danger': titleErrors.length }" :message="titleErrors">
                    <b-input placeholder="Enter a title..." v-model="title" required :disabled="petitionIsClosed"></b-input>
                </b-field>

                <b-field label="Description" :type="{ 'is-danger': descriptionErrors.length }" :message="descriptionErrors">
                    <b-input placeholder="Enter a description..." v-model="description" type="textarea" :disabled="petitionIsClosed"></b-input>
                </b-field>

                <b-field label="Category">
                    <b-select placeholder="Select a Category" v-model="categoryId" required :disabled="petitionIsClosed">
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
                                      :timepicker="{ enableSeconds, hourFormat: format }"
                                      :disabled="petitionIsClosed"
                                      editable>
                    </b-datetimepicker>
                </b-field>

                <span>
                    <span class="register-buttons">
                        <b-button v-on:click="cancelEdit">Cancel</b-button>
                        <b-button type="is-primary" v-on:click="submit" style="margin-left: 5px" :disabled="petitionIsClosed">Save</b-button>
                    </span>
                    <button class="button is-danger" @click="confirmDelete()">
                        Delete
                    </button>
                </span>

            </section>
        </div>
    </div>
</template>


<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "EditPetition",

        components: {
            NavBar
        },

        mounted: async function() {
            this.api = new UserApiClient("http://localhost:8080/");

            let petitionResponse = await this.api.getPetition(this.$route.params.id);

            switch (petitionResponse.statusText) {
                case "OK":
                    if (petitionResponse.data.authorId === parseInt(sessionStorage.getItem("userId"))) {
                        //Check if petition is closed or not
                        if (petitionResponse.data.closingDate) {
                            if (new Date(petitionResponse.data.closingDate) < Date.now()) {
                                //Petition is closed
                                this.petitionIsClosed = true;
                                this.$buefy.dialog.alert({
                                    title: 'Petition Closed',
                                    type: "is-danger",
                                    message: `This petition closed on ${new Date(petitionResponse.data.closingDate).toDateString()}. You may not edit it but you can delete it.`,
                                    confirmText: 'Ok'
                                });
                            }
                        }
                        // eslint-disable-next-line no-case-declarations
                        let categoryResponse = await this.api.getCategories();
                        this.updateData(petitionResponse.data);
                        this.updateCategories(categoryResponse.data);
                    } else {
                        if (sessionStorage.getItem("userId")) { //The user is logged in, but forbidden
                            await this.$router.push({name: "forbidden"});
                        } else { //userId doesn't exist, so user not logged in
                            await this.$router.push({name: "login"});
                        }
                    }
                    break;


                case "Not Found":
                    await this.$router.push({name: "notFound"});
                    break;
            }

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
                titleErrors: [],
                descriptionErrors: [],
                categoryErrors: [],
                closingDateErrors: [],
                showWeekNumber: true,
                enableSeconds: false,
                format: "24",
                petitionIsClosed: false
            }
        },


        methods: {

            /**
             * Checks if the fields are empty
             */
            checkFields() {
                this.titleErrors = [];
                this.descriptionErrors = [];
                this.categoryErrors = [];
                this.closingDateErrors = [];

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
                    let reader = new FileReader;
                    reader.onload = e => {
                        this.previewImage = e.target.result;
                    }
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
             * Attempts to create the petition in by sending the field data
             * Will display errors in the error box if unsuccessful
             */
            async editPetition() {
                let petitionData = {
                    "title": this.title,
                    "description": this.description,
                    "categoryId": this.categoryId
                };

                if (this.closingDate) {
                    petitionData["closingDate"] = this.closingDate.getFullYear() + "-" + (this.closingDate.getMonth() + 1) + "-" + this.closingDate.getDate() + " " + this.closingDate.toLocaleTimeString()
                }

                let response = await this.api.editPetition(petitionData, this.$route.params.id);
                switch (response.statusText) {
                    case "OK":
                        if (this.hasUploaded) {
                            await this.api.uploadPetitionPhoto(this.$route.params.id, this.file);
                        }
                        await this.$router.push({name: "viewPetition", params: {id: this.$route.params.id}});
                        break;

                    case " ":
                        this.emailErrors.push("Email address already in use");
                        break;

                    case '  ':
                        this.emailErrors.push("Invalid Email");
                        break;

                    default:
                        break;
                }

            },

            updateCategories(categoryData) {
                this.categories = [];
                for (let i = 0; i < categoryData.length; i++) {
                    if (categoryData[i].name == this.category) {
                        this.categoryId = categoryData[i].categoryId;
                    }
                    this.categories.push(categoryData[i]);
                }
            },

            updateData(petitionData) {
                this.title = petitionData.title;
                this.description = petitionData.description;
                this.category = petitionData.category;
                if (petitionData.closingDate) {
                    this.closingDate = new Date(petitionData.closingDate);
                }
            },

            /**
             * Called when the submit button is pressed
             * Checks the fields are valid and then calls the login method
             */
            submit() {
                this.checkFields();
                if (this.titleErrors.length === 0 && this.descriptionErrors.length === 0 && this.categoryErrors.length === 0 && this.closingDateErrors.length === 0) {
                    this.editPetition();
                }
            },

           async confirmDelete() {
                this.$buefy.dialog.confirm({
                    title: 'Delete Petition',
                    message: 'Are you sure you want to <b>delete</b> this petition? This action cannot be undone.',
                    confirmText: 'Delete Petition',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => { this.api.deletePetition(this.$route.params.id); this.$router.push({name: "myProfile", params: {id: sessionStorage.getItem("userId")}}); }
                })
            },

            async cancelEdit() {
                await this.$router.push({name: "myProfile", params: {id: sessionStorage.getItem("userId")}});
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
