import {Component, OnInit} from '@angular/core';
import {AlertController, IonicPage, Loading, LoadingController, NavController, NavParams} from 'ionic-angular';

import { RegistrationUser } from './../../../providers/AWS/cognito.service';
import {UserService} from '../../../providers/authentication/userService.service';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage implements OnInit{

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
      if(message === "PreSignUp failed with error Apikey non valida!.") {
        this.errorApikey = "Licenza non valida";
      }
      else{
        this.errorMessage = message;
      }
      console.log("result: " + message);
    } else { //success
      console.log("REGISTRAZIONE COMPLETATA");
      this.userService.authenticate(this.user.email, this.user.password, this);
      //this.navCtrl.pop();
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
      console.log("CONFIRM IN COMPLETED!");
      this.userService.authenticate(this.user.email, this.user.password, this);
    }
  }

  // dopo essersi registrato lo faccio direttamente loggare da questa pagina
  private presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Codice Conferma',
      subTitle:'Inserisci il codice di conferma che è stato inviato a '+this.user.email+' (controlla anche nello spam/promozioni): ',
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

  private callAlert() {
    let alert = this.alertCtrl.create({
      title: 'Ricontrolla i campi',
      subTitle: 'Campo vuoto o ricontrolla la nuova password',
      buttons: ['Chiudi']
    });
    alert.present();
  }

  protected checkAll(){
    if(this.user.password === "" || this.user.email === "" || this.user.family_name === ""|| this.user.name === "") {
      this.callAlert();
    }
    else if((this.confirmedPassword !== this.user.password) || (this.user.password.length < 8)){
      this.callAlert();
    }
    else {
      this.register();
      //console.log("Register");
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
