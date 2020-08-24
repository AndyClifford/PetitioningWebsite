import Login from "./components/Login.vue";
import Register from "./components/Register";
import Home from "./components/Home.vue";
import Profile from "./components/Profile.vue";
import EditProfile from "./components/EditProfile.vue";
import EditPetition from "./components/EditPetition.vue";
import ChangePassword from "./components/ChangePassword.vue";
import ViewPetition from "./components/ViewPetition.vue";
import StartPetition from "./components/StartPetition";
import NotFound from "./components/NotFound.vue";
import Forbidden from "./components/Forbidden.vue";
import App from "./App.vue";


const routes = [
    {path: "/", component: App, redirect: "/browse"},

    {path: "/login", component: Login, name: "login", beforeEnter: (to, from, next) => {
        if (sessionStorage.getItem("userId")) { //The user is already logged in
            next({name: "home"});
        } else {
            next();
        }
    }},

    {path: "/register", component: Register, name:"register"},
    {path: "/browse", component: Home, name: "home"},

    { path: '/404', component: NotFound, name: "notFound" },
    { path: '*', redirect: '/404' },

    {path: "/profile/:id", component: Profile, name: "myProfile", beforeEnter: (to, from, next) => {
        if (sessionStorage.getItem("userId") === null) {
            next({name: "login"});
        } else {
            if (sessionStorage.getItem("userId") === to.params.id) {
                next();
            } else {
                next({name: "forbidden"});
            }
        }
    }},

    {path: "/profile/:id/edit", component: EditProfile, name: "editProfile", beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("userId") === null) {
                next({name: "login"});
            } else {
                if (sessionStorage.getItem("userId") === to.params.id) {
                    next();
                } else {
                    next({name: "forbidden"});
                }
            }
        }},


    {path: "/profile/:id/change_password", component: ChangePassword, name: "changePassword", beforeEnter: (to, from, next) => {
        if (sessionStorage.getItem("userId") === to.params.id) {
            next();
        } else {
            if (sessionStorage.getItem("userId")) { //The user is logged in
                next({
                    name: "forbidden"
                })
            } else {
                next({
                    name: "login"
                })
            }
        }
    }},

    {path: "/petitions/create", component: StartPetition, name: "startPetition", beforeEnter: (to, from, next) => {
        if (sessionStorage.getItem("userId")) {
            next();
        } else {
            next({
                name: "login"
            })
        }
    }},

    {path: "/petitions/:id", component: ViewPetition, name: "viewPetition"},

    {path: "/petitions/:id/manage", component: EditPetition, name: "editPetition"},

    {path: "/forbidden", component: Forbidden, name: "forbidden"}
];


export default routes;