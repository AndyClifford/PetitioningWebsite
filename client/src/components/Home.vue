<template>
    <div>
        <NavBar></NavBar>

        <div class="search-wrapper">
            <section>
                <router-view></router-view>

                <h1 class="name-heading">Browse Petitions</h1>

            </section>

            <b-field grouped style="margin: 10px 60px 10px;">
            <b-input v-model="searchQuery" placeholder="Search Petitions..." type="search" style="width: 600px;" @keyup.native.enter="search"></b-input>
                <p class="control">
                    <b-button class="button is-primary" @click="search">Search</b-button>
                </p>
            </b-field>

            <section>
                <b-field style="margin: 20px 60px 10px;">
                    <b-select placeholder="Filter by Category" v-model="categoryId" style="margin-left: 70px; margin-right: 10px">
                        <option :value="null"></option>
                        <option v-for="category in categories" v-bind:key="category.categoryId" :value="category.categoryId">{{ category.name }}</option>
                    </b-select>
                    <b-select placeholder="Sort By" v-model="sortBy" style="margin-right: 10px;">
                        <option>A-Z</option>
                        <option>Z-A</option>
                        <option>Signatures Ascending</option>
                        <option>Signatures Descending</option>
                    </b-select>
                    <b-button class="is-primary" @click="applyFilters">Apply filters</b-button>
                </b-field>

            </section>

        </div>

        <div class="petition-wrapper" v-bind:key="componentKey">
            <Petition v-for="petition in this.paginatedPetitions"
                      v-bind:key="petition.petitionId"
                      v-bind:petitionId="petition.petitionId"
                      v-bind:title="petition.title"
                      v-bind:category="petition.category"
                      v-bind:authorName="petition.authorName"
                      v-bind:signatureCount="petition.signatureCount"
                      v-bind:isHomePage="true">
            </Petition>

            <div style="margin: auto auto 20px;">
                <b-pagination
                        :total="allPetitions.length"
                        :current.sync="current"
                        :range-before="rangeBefore"
                        :range-after="rangeAfter"
                        :order="order"
                        :size="size"
                        :simple="isSimple"
                        :rounded="isRounded"
                        :per-page="perPage"
                        aria-next-label="Next page"
                        aria-previous-label="Previous page"
                        aria-page-label="Page"
                        aria-current-label="Current page">
                </b-pagination>
            </div>

        </div>

    </div>
</template>


<script>
    import {UserApiClient} from "../Api";
    import NavBar from "./NavBar.vue";
    import Petition from "./Petition.vue";

    export default {
        name: "Home",

        components: {
            NavBar,
            Petition
        },

        watch: {
            '$route.query.search': function () {
                this.$forceUpdate()
            }
        },

        mounted: async function () {
            this.api = new UserApiClient("http://localhost:8080/");
            let petitionResponse;
            let query = this.$route.query["search"];
            if (this.$route.query["search"] !== undefined && this.$route.query["search"] !== "") {
                petitionResponse = await this.api.getPetitions("q=" + query);
            } else {
                petitionResponse = await this.api.getPetitions();
            }
            let categoryResponse = await this.api.getCategories();
            this.updateData(petitionResponse.data);
            this.updateCategories(categoryResponse.data);
        },

        data() {
            return {
                allPetitions: [],
                filteredPetitions: [],
                categories: [],
                categoryId: null,
                componentKey: 0,

                searchQuery: "",
                lastSearchQuery: "",
                sortBy: "Signatures Descending",
                sortMap: {
                    "A-Z": "ALPHABETICAL_ASC",
                    "Z-A": "ALPHABETICAL_DESC",
                    "Signatures Ascending": "SIGNATURES_ASC",
                    "Signatures Descending": "SIGNATURES_DESC"
                },

                current: 1,
                perPage: 10,
                rangeBefore: 2,
                rangeAfter: 2,
                order: '',
                size: '',
                isSimple: false,
                isRounded: false,
            }
        },

        computed: {
            paginatedPetitions() {
                return this.allPetitions.slice((this.current - 1) * this.perPage, (this.current) * this.perPage);
            }
        },

        methods: {
            updateData(petitionData) {
                this.allPetitions = [];
                for (let i = 0; i < petitionData.length; i++) {
                    this.allPetitions.push(petitionData[i]);
                }
                // this.paginate();
            },

            // paginate() {
            //     this.paginatedPetitions = this.allPetitions.slice(this.current * this.perPage, (this.current + 1) * this.perPage);
            //
            // },

            updateCategories(categoryData) {
                this.categories = [];
                for (let i = 0; i < categoryData.length; i++) {
                    this.categories.push(categoryData[i]);
                }
            },

            async search() {
                let query = "";
                let flag = 0;
                if (this.searchQuery === "") {
                    flag = 1;
                } else {
                    query = "q=" + this.searchQuery;
                }

                if (this.categoryId && !flag) {
                    query += "&categoryId=" + this.categoryId;
                }
                if (this.sortBy && !flag) {
                    query += "&sortBy=" + this.sortMap[this.sortBy];
                }
                let petitionResponse = await this.api.getPetitions(query);
                this.updateData(petitionResponse.data);

                if (!flag) {
                    await this.$router.push({name: "home", query: {"search": this.searchQuery}}).catch(err => {
                        if (err.name !== "NavigationDuplicated") {
                            // But print any other errors to the console
                            console.error(err);
                        }
                    });
                    this.componentKey += 1;
                } else {
                    await this.$router.push({name: "home"}).catch(err => {
                        if (err.name !== "NavigationDuplicated") {
                            // But print any other errors to the console
                            console.error(err);
                        }
                    });
                    this.componentKey += 1;
                }


            },

            async applyFilters() {
                let query = "sortBy=";
                query += this.sortMap[this.sortBy].toString();
                let queryMap = {"sortBy": this.sortMap[this.sortBy] };

                if (this.$route.query.search !== undefined && this.$route.query["search"] !== "") {
                    query += "&q=";
                    query += this.$route.query.search;
                    queryMap["search"] = this.$route.query.search;
                }

                if (this.categoryId !== null) {
                    query += "&categoryId=";
                    query += this.categoryId.toString();
                    queryMap["categoryId"] = this.categoryId;
                }

                let petitionResponse = await this.api.getPetitions(query);
                this.updateData(petitionResponse.data);

                // await this.$router.push({name: "home", query: queryMap}).catch(err => {
                //     if (err.name !== "NavigationDuplicated") {
                //         // But print any other errors to the console
                //         console.error(err);
                //     }
                // });
            }
        }
    }
</script>

<style>

    .search-wrapper {
        margin: 5px auto 20px;
        text-align: center;
        width: 800px;
        height: 200px;
    }

    .name-heading {
        font-size: 32pt;
        text-align: center;
        font-family: "Helvetica Neue";
        font-weight: bold;
        margin: auto auto 20px;
    }

    .petition-wrapper {
        margin: 5px auto 100px;
        width: 800px;
        height: 1000px;
    }

</style>