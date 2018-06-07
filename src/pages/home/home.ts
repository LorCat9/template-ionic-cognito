import {Component, OnInit} from '@angular/core';
import { NavController } from 'ionic-angular';
import {UserService} from '../../providers/authentication/userService.service';
import {LoggedInCallback} from '../../providers/AWS/cognito.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, LoggedInCallback{

  constructor(public navCtrl: NavController,
              private userService: UserService) {

  }

  ngOnInit() {
    this.userService.isAuthenticated(this);
  }

  isLoggedInCallback(message: string, isLoggedIn: boolean, username: string) {
    if (!isLoggedIn) {
      this.navCtrl.setRoot('LoginPage');
    }
  }

}
