import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, Loading, LoadingController} from 'ionic-angular';

// Providers
import { UserService } from './../../../providers/authentication/userService.service';
import {LoginUser} from '../../../providers/AWS/cognito.service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  user = {} as LoginUser;
  codiceConferma: string;
  errorMessage: string;

  needNewPassword = false;
  needCode = false;

  private loader: Loading;

  constructor(public navCtrl: NavController,
    public userService: UserService,
    private loadingCtrl: LoadingController) { }


  ionViewLoaded() {
    this.userService.logout();
  }

  goToRegister() {
    this.navCtrl.push('RegisterPage');
  }

  goToResendCode() {
    this.navCtrl.push('ResendCodePage');
  }

  goToForgotPasswrod() {
    this.navCtrl.push('ForgotPasswordPage');
  }


  // AWS Cognito section

  signMeIn() {
    this.errorMessage = null;
    if (this.user.email == null || this.user.password == null) {
      this.errorMessage = "Devono essere completati tutti i campi";
      return;
    }
    this.presentLoading();
    this.user.email = this.user.email.toLowerCase();
    if (this.codiceConferma)
      this.userService.confirmRegistration(this.user.email, this.codiceConferma, this);
    else if (!this.user.newpassword)
      this.userService.authenticate(this.user.email, this.user.password, this);
    else
      this.userService.authenticate(this.user.email, this.user.password, this, this.user.newpassword);
  }

  authenticateCallback(message: string, result: any) {
    if (message != null) { //error
      this.dismissLoader();
      if (message == "New password is required.") {
        this.needNewPassword = true;
      }
      else if (message == "User is not confirmed.") {
        this.needCode = true;
      }
      else {
        this.errorMessage = message;
      }

    } else { //success HERE set AWS creds to establishing a user session with the Amazon Cognito Identity service.
      this.userService.setAWSConfig(result);
    }
  }

  confirmUserCallback(message: string, result: any) {
    this.dismissLoader();
    if (message != null) { //error
      this.errorMessage = message;
    }
    else { //success
      console.log("CONFIRM IN COMPLETED!");
      this.userService.authenticate(this.user.email, this.user.password, this);
    }
  }

  isLoggedInCallback(message: string, isLoggedIn: boolean) {
    console.log("The user is logged in: " + isLoggedIn);
    if (isLoggedIn) {

    }
  }

  private presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait...",
    });
    this.loader.present();
  }

  private dismissLoader(){
    this.loader.dismiss();
  }


}
