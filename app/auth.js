//export const authenticate = async (email, password, user_type) => {

//    // Broadcast logout event to other tabs before logging in the user
//    localStorage.setItem("authEvent", JSON.stringify({event: "logout"}));

//    // login call to server.
//    //this.rootStore.uiStore.isLoading = true;
//    const authUrl = "login/email";
//    try {
//        const res = await API.post(authUrl, {
//            email,
//            password,
//            user_type,
//        }).then((response) => {
//            if (response?.data?.success === "false") {
//                return response?.data;
//            }

//            const token = response?.data?.data?.token;
//            const decode = jwtDecode(token);
//            if (response && response?.data) {
//                this.userObj = this._generateUserObj(decode, email);
//                this.captchaRequired = false;
//                window.sessionStorage.userObj = JSON.stringify(this.userObj);
//                window.sessionStorage.oktaSession = false;
//                localStorage.setItem("apiToken", response.data.data.token);
//                localStorage.setItem("token", this.userObj.sessionToken);
//                localStorage.setItem("userObj", JSON.stringify(this.userObj));

//                // Broadcast login event to other tabs
//                localStorage.setItem(
//                    "authEvent",
//                    JSON.stringify({event: "login", userObj: this.userObj})
//                );

//                return this.userObj;
//            } else {
//                throw new Error(
//                    "Something went wrong with your login, please try again."
//                );
//            }
//        });

//        return res;
//    } catch (err) {
//        if (err?.response?.status === 400) {
//            throw new Error("Incorrect login, please try again.");
//        } else {
//            throw new Error(
//                "Something went wrong with your login, please try again."
//            );
//        }
//    } finally {
//        this.rootStore.uiStore.setLoader = false;
//    }

//}





import API from "./api";

// REGISTER API
const RegisterUser = async (formData) => {
    try {
        const response = await API.post("/register", formData);
        return response.data;
    } catch (error) {
        throw error?.response?.data || {message: "Registration failed"};
    }
};

export default RegisterUser
