import { Component } from '@angular/core';
import {IonicPage, NavController, Loading, LoadingController} from 'ionic-angular';

// Providers
import { UserService } from './../../../providers/authentication/userService.service';
import {AuthenticateCallback, ConfirmUserCallback, LoginUser} from '../../../providers/AWS/cognito.service';
import {
  _ERROR_INSERIMENTO_DATI_LOGIN,
  _MESSAGE_LOADER
} from '../../../CONFIG/CONFIG';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements AuthenticateCallback, ConfirmUserCallback {

  user = {} as LoginUser;
  confirmationCode: string;
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
      this.errorMessage = _ERROR_INSERIMENTO_DATI_LOGIN;
      return;
    }
    this.presentLoading();
    this.user.email = this.user.email.toLowerCase();
    if (this.confirmationCode)
      this.userService.confirmRegistration(this.user.email, this.confirmationCode, this);
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

    } else {      // success HERE set AWS creds to establishing a user session with the Amazon Cognito Identity service.
      this.userService.setAWSConfig(result);
      this.navCtrl.setRoot('HomePage');   // Rimando sulla HomePage
    }
  }

  confirmUserCallback(message: string, result: any) {
    this.dismissLoader();
    if (message) {      // error
      this.errorMessage = message;
    }
    else {              // success
      this.userService.authenticate(this.user.email, this.user.password, this);
    }
  }

  private presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: _MESSAGE_LOADER,
    });
    this.loader.present();
  }

  private dismissLoader(){
    this.loader.dismiss();
  }


}
