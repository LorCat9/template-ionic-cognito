import { Component } from '@angular/core';
import {IonicPage, Loading, LoadingController, NavController} from 'ionic-angular';
import {UserService} from '../../../providers/authentication/userService.service';
import {CognitoCallback} from '../../../providers/AWS/cognito.service';

@IonicPage()
@Component({
  selector: 'page-resend-code',
  templateUrl: 'resend-code.html',
})
export class ResendCodePage implements CognitoCallback{

  email: string;
  errorMessage: string;
  private loader: Loading;

  constructor(private userService: UserService,
              public navCtrl: NavController,
              private loadingCtrl: LoadingController) {
  }

  resendCode () {
    this.presentLoading();
    this.userService.resendCode(this.email.toLowerCase(), this);
  }

  cognitoCallback(message: string, result: any) {
    this.dismissLoader();
    if (message != null) { //error
      this.errorMessage = message;
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
