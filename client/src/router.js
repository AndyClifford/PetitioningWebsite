import routes from "./routes.js"
import VueRouter from "vue-router";
import {UserApiClient} from "./Api";


let api = new UserApiClient("http://localhost:8080/");


/**
 * Sets up the router with the defined routes in routes.js
 * and any routing guards
 * @return {VueRouter}
 */
export function routerSetup() {
    const router = new VueRouter({mode: "history", routes});
    beforeRouteGuard(router);
    return router;
}


/**
 * Sets up the before route guard
 * This guard is run before each route is pushed.
 * to: The destination route
 * from: The source route
 * @param router
 */
function beforeRouteGuard(router) {
    router.beforeEach(async (to, from, next) => {
        if (to.meta.requiresAuth) {
            let response = await api.getUserData(5);

            console.log(response.status);
            if (response.status === 200) {
                next();
            }
            else {
                // Redirect to login
                next({
                    name: "login"
                })
            }
        } else {
            next();
        }
    });
}

export default routerSetup;