<template>
    <div>

        <NavBar></NavBar>

        <div class="petition-container">
            <h1 class="name-heading">{{ title }}</h1>
            <br>

            <div class="columns">
                <div class="column is-two-thirds">
<!--                    this column will include the hero image, and all of the petition info-->
                    <div class="hero-image-container">
<!--                        set some sort of max height on the picture-->
                        <img v-if="hasHeroImage" :src="`http://localhost:4941/api/v1/petitions/${this.petitionId}/photo`" alt="Image">
                    </div>
                    <br>

                    <div class="author-container">

                        <div class="columns">
                            <div class="column is-one-quarter">

                                <div class="author-heading">Author
                                </div>

                                <div v-if="hasProfilePicture">
                                    <div class="image is-128x128" :style="{ 'background-image': `url(http://localhost:4941/api/v1/users/${this.authorId}/photo` }">
                                    </div>
                                </div>

                                <div v-else>
                                    <figure class="image is-128x128" style="margin-left: 25px; display: block;">
                                        <img type="is-rounded" src="../../assets/default-user-profile.jpg">
                                    </figure>
                                </div>
                            </div>
                            <div class="column" style="text-align: left">
                                <br>
                                <br>
                                <div id="parent" style="margin-top: 10px">
                                    <div class="is-child"><strong>{{ authorName }}</strong></div>
                                    <div class="is-child">{{ authorCity }}</div>
                                    <div class="is-child"> {{ authorCountry }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="petition-details">
                            <div class="author-heading" style="text-align: left; margin-left: 57px;">Details
                            </div>

                            <div style="text-align: left; margin-left: 57px;">
                                {{ description }}
                            </div>
                            <br>

                            <div style="text-align: left; margin-left: 57px; margin-bottom: 10px">
                                <strong>Category:</strong> {{ category }}
                            </div>

                            <div style="text-align: left; margin-left: 57px; margin-bottom: 10px">
                                <strong>Created Date:</strong> {{ new Date(createdDate) }}
                            </div>

                            <div v-if="closingDate !== null" style="text-align: left; margin-left: 57px; margin-bottom: 10px">
                                <strong>Closing Date:</strong> {{ new Date(closingDate) }}
                            </div>

                            <div v-else style="text-align: left; margin-left: 57px; margin-bottom: 10px">
                                <strong>Closing Date:</strong> No closing date has been set
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column">
                    <div class="signature-container">
                        <div v-if="!petitionIsClosed">
                            <div>
                                <b-button v-if="!hasSigned &&!isAuthor" class="is-primary" size="is-large" @click="signPetition">Sign this Petition</b-button>
                            </div>
                            <div>
                                <b-button v-if="hasSigned && !isAuthor" class="is-primary" size="is-large" @click="deleteSignature">Delete Signature</b-button>
                            </div>
                        </div>

                        <div v-else>
                            <div class="author-heading" style="font-size: 26pt;">
                                <strong>Petition Closed</strong>
                            </div>
                        </div>

                        <div>
                            <br>
                            <div v-if="signatureCount === 1">
                                1 person has signed this petition
                            </div>
                            <div v-else>
                                {{signatureCount}} people have signed this petition
                            </div>
                        </div>

                        <div>
                            <br>
                            <strong>Share this petition</strong>
                            <div>
                                <a href="#" target="_blank"
                                   onclick="
                                    window.open(
                                      'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent('https://canterbury.ac.nz' + window.location.pathname),
                                      'facebook-share-dialog',
                                      'width=626,height=436');
                                    return false;">
                                    Share on Facebook
                                </a>
                            </div>
                            <div>
                                <a href="mailto:?subject=I would like you to sign this petition&body=Check out this Petition! https://canterbury.ac.nz[sub]" onclick="this.href = this.href.replace('[sub]',window.location.pathname)">Email</a>
                            </div>
                            <div>
                                <a class="twitter-share-button"
                                   href="https://twitter.com/intent/tweet?text=Check out this Petition! &url=https://canterbury.ac.nz[sub]" onclick="this.href = this.href.replace('[sub]', window.location.pathname)" target="_blank">
                                    Twitter</a>
                            </div>

                        </div>

                        <div>
                            <br>
                            <div style="margin-bottom: 20px;"><strong>Signatories</strong></div>

                            <div class="signatory-container">
                                <div class="columns" v-for="signatory in this.signatoryList" v-bind:key="signatory.signatoryId">
                                    <div class="column is-one-fifth">
                                        <div v-if="signatory['hasPhoto']" class="image is-32x32"  style="margin-left: 20px; display: block;" :style="{ 'background-image': `url(http://localhost:4941/api/v1/users/${signatory.signatoryId}/photo`}">
                                        </div>
                                        <figure v-else class="image is-32x32" style="margin-left: 20px; display: block;">
                                            <img type="is-rounded" src="../../assets/default-user-profile.jpg">
                                        </figure>
                                    </div>
                                    <span class="column" style="text-align: left;">
                                        {{ signatory.name }}
                                        <span v-if="signatory.city && signatory.country"> ({{ signatory.city }}, {{ signatory.country }})</span>
                                        <span v-if="!signatory.city && signatory.country"> ({{ signatory.country }})</span>
                                        <span v-if="signatory.city && !signatory.country"> ({{ signatory.city }})</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";

    export default {
        name: "ViewPetition",

        components: {
            NavBar
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");

            this.petitionId = this.$route.params.id;
            let petitionResponse = await this.api.getPetition(this.petitionId);
            let petitionPhotoResponse;
            let authorPhotoResponse;
            switch (petitionResponse.statusText) {
                case "OK":
                    petitionPhotoResponse = await this.api.getPetitionPhoto(this.petitionId);
                    this.hasHeroImage = petitionPhotoResponse.statusText === "OK";
                    this.updateData(petitionResponse.data);
                    authorPhotoResponse = await this.api.getUserPhoto(petitionResponse.data.authorId);
                    this.hasProfilePicture = authorPhotoResponse.statusText === "OK";
                    this.updateSignatories(this.petitionId);
                    break;

                case "Not Found":
                    await this.$router.push({name: "notFound"});
                    break;

                default:
                    await this.$router.push({name: "notFound"});
                    break;
            }

        },

        data() {
            return {
                hasHeroImage: true,
                hasProfilePicture: false,

                petitionId: null,
                title: "",
                description: "",
                signatureCount: 0,
                category: "",
                createdDate: "",
                closingDate: "",
                signatoryList: [],
                petitionIsClosed: false,

                authorId: 0,
                authorName: "",
                authorCity: "",
                authorCountry: "",

                hasSigned: false,
                isAuthor: false
            }
        },

        methods: {
            updateData(petitionData) {
                this.title = petitionData.title;
                this.description = petitionData.description;
                this.authorId = petitionData.authorId;
                this.authorName = petitionData.authorName;
                this.authorCity = petitionData.authorCity;
                this.authorCountry = petitionData.authorCountry;
                this.category = petitionData.category;
                this.signatureCount = petitionData.signatureCount;
                this.createdDate = petitionData.createdDate;
                this.closingDate = petitionData.closingDate;

                this.authorId = petitionData.authorId;
                if (this.authorId === parseInt(sessionStorage.getItem("userId"))) {
                    this.isAuthor = true;
                }

                let currentDate = new Date();
                if (this.closingDate) { //A closing date exists
                    //Check if the petition is closed
                    let closeDate = Date.parse(this.closingDate);
                    if (currentDate.getTime() > closeDate) {
                        this.petitionIsClosed = true;
                    }
                }
            },

            async updateSignatories(petitionId) {
                let signatoryResponse = await this.api.getSignatories(petitionId);
                this.signatoryList = [];
                for (let i = 0; i < signatoryResponse.data.length; i++) {
                    if (signatoryResponse.data[i]["signatoryId"] === parseInt(sessionStorage.getItem("userId"))) {
                        this.hasSigned = true;
                    }
                    let photoResponse = await this.api.getUserPhoto(signatoryResponse.data[i]["signatoryId"]);
                    signatoryResponse.data[i]["hasPhoto"] = photoResponse.statusText === "OK";
                    this.signatoryList.push(signatoryResponse.data[i]);
                }
                this.signatureCount = this.signatoryList.length;
            },

            async signPetition() {
                let signatureResponse = await this.api.signPetition(this.$route.params.id);
                switch (signatureResponse.statusText) {
                    case "Created":
                        await this.updateSignatories(this.$route.params.id);
                        break;

                    case "Unauthorized":
                        //Not logged in
                        await this.$router.push({name: "login"});
                        break;

                    default:
                        break;
                }
            },

            async deleteSignature() {
                await this.api.deleteSignature(this.$route.params.id);
                await this.updateSignatories(this.$route.params.id);
                this.hasSigned = false;
            }
        }
    }
</script>

<style>
    .petition-container {
        word-wrap: break-word;
        text-align: center;
        /*background: aqua;*/
        margin: 3em auto auto;
        width: 1200px;
        min-height: 800px;
    }

    .name-heading {
        font-size: 40pt;
    }

    .hero-image-container {
        text-align: center;
        vertical-align: middle;
        margin: auto 20px auto;
    }

    .signatory-container {
        height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .image.is-32x32 {
        border-radius: 50%;
        display: block;
        cursor: pointer;
        margin: 0 auto 10px;
        background-size: cover;
        background-position: center center;
    }

    .author-heading {
        font-size: 14pt;
        padding-bottom: 10px;
        text-align: center;
        font-family: "Helvetica Neue";
        font-weight: bold;
    }

    .petition-details {
        margin-bottom: 100px;
    }

    .image.is-32x32 {
        border-radius: 50%;
    }

</style>