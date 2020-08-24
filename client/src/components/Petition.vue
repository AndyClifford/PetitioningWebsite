<template>
    <div class="box" @click="viewPetition(petitionId)">
        <article class="media">
            <div class="media-left">
                <figure class="image is-128x128">
                    <img v-if="hasPhoto" :src="`http://localhost:4941/api/v1/petitions/${this.petitionId}/photo`" alt="Image">
                    <img v-else src="https://bulma.io/images/placeholders/128x128.png" alt="Image">
                </figure>
            </div>
            <div class="media-content">
                <div class="content">
                    <p>
                        <strong class="petition-title">{{ title }}</strong> <span style="float: right; font-style: italic;">By {{ authorName }}</span>
                    </p>
                </div>
                <p>
                    <strong>Category:</strong> {{ category }}
                </p>
                <p>
                    <strong>Signature Count:</strong> {{ signatureCount }}
                    <b-button v-if="!isHomePage" class="is-primary" style="float: right;" @click="(e) => editPetition(e, petitionId)">Manage Petition</b-button>
                </p>

            </div>
        </article>
    </div>
</template>

<script>
    import {UserApiClient} from "../Api";

    export default {
        name: "Petition",
        props: {
            petitionId: {
                type: Number
            },
            title: {
                type: String,
            },
            category: {
                type: String
            },
            authorName: {
                type: String
            },
            signatureCount: {
                type: Number
            },
            isHomePage: {
                type: Boolean
            }
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");
            this.petitionPhotoResponse = await this.api.getPetitionPhoto(this.petitionId);

            switch (this.petitionPhotoResponse.statusText) {
                case "OK":
                    this.hasPhoto = true;
                    break;

                case "Not Found":
                    this.hasPhoto = false;
                    break;
            }
        },

        data() {
            return {
                hasPhoto: null
            }
        },

        methods: {
            async viewPetition(petitionId) {
                await this.$router.push({name: "viewPetition", params: {id: petitionId}});
            },

            async editPetition(event, petitionId) {
                event.stopPropagation();
                await this.$router.push({name:'editPetition', params: {id: petitionId}});
            },

        }
    }
</script>

<style>

    .petition-title {
        font-size: 20pt;
        font-weight: bolder;
    }

    .box:hover {
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.8);
        cursor: pointer;
    }

    .box {
        word-break: break-word;
    }

</style>