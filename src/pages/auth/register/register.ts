import {Component, OnInit} from '@angular/core';
import {AlertController, IonicPage, Loading, LoadingController, NavController} from 'ionic-angular';

import {
  AuthenticateCallback, CognitoCallback, ConfirmUserCallback,
  RegistrationUser
} from './../../../providers/AWS/cognito.service';
import {UserService} from '../../../providers/authentication/userService.service';
import {
  _ALERT_CC_SUBTITLE, _ALERT_CC_TITLE, _ALERT_ERROR_CAMPI_SUBTITLE, _ALERT_ERROR_CAMPI_TITLE, _ERROR_LICENZA_NON_VALIDA,
  _MESSAGE_LOADER, _MIN_PSW_LENGTH
} from '../../../CONFIG/CONFIG';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage implements OnInit, AuthenticateCallback, CognitoCallback, ConfirmUserCallback{

  user = {} as RegistrationUser;
  confirmedPassword;
  errorMessage;
  errorApikey;
  private loader: Loading;

  constructor(private userService: UserService,
              public navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,) { }

  ngOnInit(){
    this.user.password = "";
    this.user.email = "";
    this.user.family_name = "";
    this.user.name = "";
    this.confirmedPassword="";
  }

  private register() {
    this.presentLoading();
    // trasformo email e apikey in tutto minuscolo
    this.user.email = this.user.email.toLowerCase();
    this.user.apikey = this.user.apikey.toLowerCase();
    this.userService.register(this.user, this);
  }

  cognitoCallback(message: string, result: any) {
    if (message != null) { //error
      this.dismissLoader();
      if(message === "PreSignUp failed with error Apikey non valida!.") {   // È il messaggio che mi arriva dalla Lambda
        this.errorApikey = _ERROR_LICENZA_NON_VALIDA;
      }
      else{
        this.errorMessage = message;
      }
    } else { //success
      this.userService.authenticate(this.user.email, this.user.password, this);
    }
  }

  authenticateCallback(message: string, result: any) {
    this.dismissLoader();
    if (message != null) {
      if (message == "New password is required.") {
        this.navCtrl.pop();
      }
      else if (message == "User is not confirmed.") {
        this.presentPrompt();
      }
      else {
        this.navCtrl.pop();
        this.errorMessage = message;
      }
    }
    else { //success HERE set AWS creds to establishing a user session with the Amazon Cognito Identity service.
      this.userService.setAWSConfig(result);
    }
  }

  confirmUserCallback(message: string, result: any) {
    if (message != null) { //error
      this.errorMessage = message;
      this.dismissLoader();
    }
    else { //success
      this.userService.authenticate(this.user.email, this.user.password, this);
    }
  }

  // dopo essersi registrato lo faccio direttamente loggare da questa pagina
  private presentPrompt() {
    let alert = this.alertCtrl.create({
      title: _ALERT_CC_TITLE,
      subTitle:_ALERT_CC_SUBTITLE,
      inputs: [
        {
          name: 'codice',
          placeholder: 'codice'
        }
      ],
      buttons: [
/*        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },*/
        {
          text: 'Conferma',
          handler: data => {  // data.codice
            this.presentLoading();
            this.userService.confirmRegistration(this.user.email, data.codice, this);
          }
        }
      ]
    });
    alert.present();
  }

  // alert errore compilazione
  private callAlert() {
    let alert = this.alertCtrl.create({
      title: _ALERT_ERROR_CAMPI_TITLE,
      subTitle: _ALERT_ERROR_CAMPI_SUBTITLE,
      buttons: ['Chiudi']
    });
    alert.present();
  }

  protected checkAll(){
    if(this.user.password === "" || this.user.email === "" || this.user.family_name === ""|| this.user.name === "") {
      this.callAlert();
    }
    else if((this.confirmedPassword !== this.user.password) || (this.user.password.length < _MIN_PSW_LENGTH)){
      this.callAlert();
    }
    else {
      this.register();
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
