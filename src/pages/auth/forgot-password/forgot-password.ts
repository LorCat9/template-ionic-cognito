import {Component, OnInit} from '@angular/core';
import {IonicPage, Loading, LoadingController, NavController} from 'ionic-angular';

import {UserService} from '../../../providers/authentication/userService.service';
import {CognitoCallback, LoginUser} from '../../../providers/AWS/cognito.service';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage implements OnInit, CognitoCallback{

  user = {} as LoginUser;
  codice: string;
  needCode: boolean;
  private loader: Loading;
  errorMessage: string;

  constructor(private userService: UserService,
              public navCtrl: NavController,
              private loadingCtrl: LoadingController) {
  }

  ngOnInit(){
    this.user.newpassword = "";
  }

  forgot() {
    this.presentLoading();
    this.userService.forgotPassword(this.user.email, this);
  }

  confirmNew() {
    this.presentLoading();
    this.userService.confirmNewPassword(this.user.email, this.codice, this.user.newpassword, this);
  }

  cognitoCallback(message: string, result: any) {
    this.dismissLoader();
    if (message != null) { //error
      this.errorMessage = message;
    }
    else { //success
      this.needCode = true;
    }
    if (result) {
      this.navCtrl.pop();
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
