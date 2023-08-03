import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { getFirebaseBackend } from '../../authUtils';

import { User } from '../models/auth.models';


@Injectable({ providedIn: 'root' })

export class AuthenticationService {
    emailOTP(enteredotp: any) {
      throw new Error('Method not implemented.');
    }

    user: User;

    constructor(private http:HttpClient) {
    }

    /**
     * Returns the current user
     */
    public currentUser(): User {
        return getFirebaseBackend().getAuthenticatedUser();
    }

    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    // login(email: string, password: string) {
    //     return getFirebaseBackend().loginUser(email, password).then((response: any) => {
    //         const user = response;
    //         return user;
    //     });
    // }

    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(email: string, password: string) {
        return getFirebaseBackend().registerUser(email, password).then((response: any) => {
            const user = response;
            return user;
        });
    }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        return getFirebaseBackend().forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }

    /**
     * Logout the user
     */
    logout() {
        // logout the user
        getFirebaseBackend().logout();
    }
    login(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/signin/login',payload)
    }

    loginEmail(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/registration/emailOTP',payload)
    }


    Email(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/registration/emailOTP',payload)
    }

    Otp(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/registration/verifyOTP',payload)
    }

    TextMeVerification(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/registration/mobileOTP',payload)
    }
    CallMeVerification(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/registration/voiceOTP',payload)
    }
    AddAdminUser(payload){
        return this.http.post('http://localhost:8082/blang/api/v1/registration/saveAdmin',payload)
    }

     // =============TOKEN FROM LOCALSTORAGE==============
     gettoken() {

        return localStorage.getItem('ERP_NEW_WEB_TOKEN');
    }
    getid(){
        return localStorage.getItem('ERP_NEW_WEB_USERID');

    }
}



