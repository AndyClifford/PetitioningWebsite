import axios from "axios";

const SERVER_URL = "http://localhost:4941/api/v1";

const server = axios.create({
    baseURL: SERVER_URL,
    timeout: 1000
});


export class UserApiClient {
    constructor(urlRoot) {
        this.urlRoot = urlRoot;
    }

    /**
     * POSTS to the login endpoint of the server with the user data in a JSON format
     * @param userData - The user's data (email and password)
     * @returns response - The server's response or error messages
     */
    async login(userData) {
        return server.post("/users/login", userData).then(function (response) {
            sessionStorage.setItem("userId", response.data.userId);
            sessionStorage.setItem("token", response.data.token);
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    /**
     * POSTS to the login endpoint of the server with the user data in a JSON format
     * @param userData - The user's data (email and password)
     * @returns response - The server's response or error messages
     */
    async logout() {
        return server.post("/users/logout", null,{headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            sessionStorage.removeItem("userId");
            sessionStorage.removeItem("token");
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    /**
     * POSTS to the register endpoint of the server with the user data in a JSON format
     * @param userData - The user's data (name, email, password, city, country)
     * @returns response - The server's response or error messages
     */
    async register(userData) {
        return server.post("/users/register", userData).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async uploadUserPhoto(id, file) {
        return server.put(`/users/${id}/photo`, file, {headers: {"X-Authorization": sessionStorage.getItem("token"), "Content-Type": file.type}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    getPetitionPhoto(id) {
        return server.get(`/petitions/${id}/photo`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async uploadPetitionPhoto(id, file) {
        return server.put(`/petitions/${id}/photo`, file, {headers: {"X-Authorization": sessionStorage.getItem("token"), "Content-Type": file.type}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async getUserPhoto(id) {
        return server.get(`/users/${id}/photo`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }

    async deleteUserPhoto(id) {
        return server.delete(`/users/${id}/photo`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async getUserData(id) {
        return server.get(`/users/${id}`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async updateUserData(id, userData) {
        return server.patch(`/users/${id}`, userData, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async getPetitions(query) {
        return server.get(`/petitions/?${query}`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async getPetition(petitionId) {
        return server.get(`/petitions/${petitionId}`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async getSignatories(petitionId) {
        return server.get(`/petitions/${petitionId}/signatures`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async signPetition(petitionId) {
        return server.post(`/petitions/${petitionId}/signatures`, null,{headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async deleteSignature(petitionId) {
        return server.delete(`/petitions/${petitionId}/signatures`,{headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async getCategories() {
        return server.get(`/petitions/categories`, {headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async createPetition(petitionData) {
        return server.post(`/petitions/`, petitionData,{headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    async editPetition(petitionData, petitionId) {
        return server.patch(`/petitions/${petitionId}`, petitionData,{headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }


    deletePetition(petitionId) {
        return server.delete(`/petitions/${petitionId}`,{headers: {"X-Authorization": sessionStorage.getItem("token")}}).then(function (response) {
            return response;

        }).catch(function (error) {
            return error.response;
        })
    }

}
