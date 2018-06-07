import {Injectable} from "@angular/core";
import {_POOL_DATA, _REGION, _IDENTITY_POOL_ID, _USER_POOL_ID} from '../../CONFIG/CONFIG';
import {CognitoUserPool} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk';

export class RegistrationUser {
    name: string;
    family_name: string;
    email: string;
    password: string;
    apikey: string
}

export class LoginUser {
  email: string;
  password: string;
  newpassword: string;
}

export interface CognitoCallback {
    cognitoCallback(message: string, result: any): void;
}

export interface AuthenticateCallback {
    authenticateCallback(message: string, result: any): void;
}

export interface ConfirmNewPasswordCallback {
    confirmNewPasswordCallback(message: string, result: any): void;
}

export interface ConfirmUserCallback {
    confirmUserCallback(message: string, result: any): void;
}

export interface LoggedInCallback {
    isLoggedInCallback(message: string, loggedIn: boolean, username: string): void;
}

export interface  Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}


@Injectable()
export class CognitoService {

  private idToken;
  private refreshToken;

  constructor() {
  }

  getUserPool() {
    return new CognitoUserPool(_POOL_DATA);
  }

  getCurrentUser() {
    return this.getUserPool().getCurrentUser();
  }

  getAccessToken(callback: Callback): void {
    if (callback == null) {
      throw("callback in getAccessToken is null...returning");
    }
    this.getCurrentUser().getSession(function (err, session) {
      if (err) {
        console.log("Can't set the credentials:" + err);
        callback.callbackWithParam(null);
      }

      else {
        if (session.isValid()) {
          callback.callbackWithParam(session.getAccessToken().getJwtToken());
        }
      }
    });
  }

  getIdToken(callback): void {
    if (callback == null) {
      throw("callback in getIdToken is null...returning");
    }
    this.getCurrentUser().getSession(function (err, session) {
      if (err) {
        console.log("Can't set the credentials:" + err);
        callback(null);
      }
      else {
        if (session.isValid()) {
          callback(session.getIdToken().getJwtToken());
        } else {
          console.log("Got the IdToken token, but the session isn't valid");
        }
      }
    });
  }

  getRefreshToken(callback): void {
    if (callback == null) {
      throw("callback in getRefreshToken is null...returning");
    }
    this.getCurrentUser().getSession(function (err, session) {
      if (err) {
        console.log("Can't set the credentials:" + err);
        callback(null);
      }

      else {
        if (session.isValid()) {
          callback(session.getRefreshToken());
        }
      }
    });
  }

  setAWSConfig(result: any) {

    this.idToken = result.getIdToken().getJwtToken();
    this.refreshToken = result.getRefreshToken().getToken();

    //POTENTIAL: Region needs to be set if not already set previously elsewhere.
    AWS.config.region = _REGION;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: _IDENTITY_POOL_ID,
        Logins: {
          // Change the key below according to the specific region your user pool is in.
          'cognito-idp.REGION.amazonaws.com/_YOUR_USER_POOL_ID': result.getIdToken().getJwtToken()    // EDIT THE KEY
        }
      }
    );
  }

  refreshSession(callback){
    let user = this.getCurrentUser();
    user.getSession(
      (error, session) => {
        if (error) {
          console.log(error);
        }
        if (session.isValid()) {
          callback(session);
        }
        else {    // session not valid
          user.refreshSession(session.refreshToken,
            (err, session) => {
              if (err)
                console.log(err);
              if (session) {
                callback(session);
              }
            }
          );
        }
      }
    );
  }

}





