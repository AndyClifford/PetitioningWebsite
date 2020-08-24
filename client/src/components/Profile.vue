<template>
    <div>
        <NavBar></NavBar>

        <div class="profile-wrapper">
            <section>
                <router-view></router-view>

                <div v-if="hasPhoto" class="image is-128x128" :style="{ 'background-image': `url(http://localhost:4941/api/v1/users/${this.$route.params.id}/photo)` }">
                </div>

                <div v-else class="profile-picture">
                    <figure class="image is-128x128">
                        <img class="is-rounded" src="../../assets/default-user-profile.jpg">
                    </figure>
                </div>

                <h1 class="name-heading">{{ name }}</h1>

                <div class="user-data">
                    <b-field class="user-data">{{ email }}</b-field>
                    <b-field class="user-data" v-if="cityAndOrCountry === 1">{{ city }}, {{ country }}</b-field>
                    <b-field class="user-data" v-if="cityAndOrCountry === 2">{{ city }}</b-field>
                    <b-field class="user-data" v-if="cityAndOrCountry === 3">{{ country }}</b-field>
                </div>

                <b-button type="is-light" size="is-small" style="margin-top: 15px;" @click="editProfile">Edit Profile</b-button>

            </section>
        </div>

        <div class="petition-wrapper">
            <Petition v-for="petition in userPetitions"
                v-bind:key="petition.petitionId"
                v-bind:petitionId="petition.petitionId"
                v-bind:title="petition.title"
                v-bind:category="petition.category"
                v-bind:authorName="petition.authorName"
                v-bind:signatureCount="petition.signatureCount">
            </Petition>
        </div>

    </div>
</template>

<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";
    import Petition from "./Petition.vue";

    export default {
        name: "Profile",

        components: {
            NavBar,
            Petition
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");

            let userResponse = await this.api.getUserData(this.$route.params.id);
            let photoResponse = await this.api.getUserPhoto(this.$route.params.id);
            this.hasPhoto = photoResponse.statusText === "OK";

            this.updateData(userResponse.data);
            await this.loadPetitions();
        },

        data() {
            return {
                hasPhoto: false,
                photo: null,
                previewImage: "",
                name: "",
                email: "",
                city: "",
                country: "",
                cityAndOrCountry: null,
                allPetitions: [],
                userPetitions: []
            }
        },

        methods: {
            updateData(userData) {
                this.name = userData.name;
                this.email = userData["email"];
                this.city = userData.city;
                this.country = userData.country;
                if (this.city && this.country) this.cityAndOrCountry = 1;
                else if (this.city) this.cityAndOrCountry = 2;
                else this.cityAndOrCountry = 3;
            },

            async getPhoto() {
                let photoResponse = await this.api.getUserPhoto(this.$route.params.id);
                switch (photoResponse.statusText) {
                    case "OK":
                        //Photo exists
                        this.hasPhoto = true;
                        // eslint-disable-next-line no-case-declarations
                        let base64Image = new Buffer.from(photoResponse.data).toString("base64");
                        this.previewImage = "data:" + photoResponse.headers["content-type"] + ";base64," + base64Image;
                        break;

                    case "Not Found":
                        //Photo doesn't exist
                        break;
                }
            },

            async editProfile() {
                await this.$router.push({name: "editProfile"});
            },

            /**
             * loads activities if they haven't already been loaded
             */
            async loadPetitions() {
                let petitionResponse = await this.api.getPetitions(`authorId=${sessionStorage.getItem("userId")}`);
                for (let i = 0; i < petitionResponse.data.length; i++) {
                    this.userPetitions.push(petitionResponse.data[i]);
                }
            },
        }
    }
</script>

<style>
    .profile-wrapper {
        text-align: center;
        margin: 3em auto auto;
        width: 1200px;
        min-height: 360px;
    }

    .name-heading {
        font-size: 32pt;
        text-align: center;
        font-family: "Helvetica Neue";
        font-weight: bold;
    }

    .petition-wrapper {
        margin: 5px auto 100px;
        width: 800px;
        height: 1000px;
    }

</style>