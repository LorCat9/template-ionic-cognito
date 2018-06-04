import {Injectable} from '@angular/core';
import {
  AuthenticateCallback, Callback, CognitoCallback, CognitoService, ConfirmUserCallback,
  LoggedInCallback, RegistrationUser
} from '../AWS/cognito.service';
import {Subject} from 'rxjs/Subject';
import {AuthenticationDetails, CognitoUser, CognitoUserAttribute} from 'amazon-cognito-identity-js';

@Injectable()
export class UserService {

  parametroRicevuto = new Subject<String>();

  constructor(private cognitoService: CognitoService) {

  }

  /** USER LOGIN */

  authenticate(email: string, password: string, callback: AuthenticateCallback, newPassword?: any) {

    let mythis = this;

    let authenticationData = {
      Username: email,
      Password: password,
    };

    let authenticationDetails = new AuthenticationDetails(authenticationData);
    let userPool = this.cognitoService.getUserPool();
    let userData = {
      Username: email,
      Pool: userPool
    };

    let cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        callback.authenticateCallback(null, result); // callback in login.ts
      },
      onFailure: function (err) {
        callback.authenticateCallback(err.message, err);
      },
      newPasswordRequired: function (userAttributes, requiredAttributes) {
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;
        delete userAttributes.phone_number_verified;

        cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
      }
    });
  }

  forgotPassword(email: string, callback: CognitoCallback) {
    let userData = {
      Username: email,
      Pool: this.cognitoService.getUserPool()
    };

    let cognitoUser = new CognitoUser(userData);

    cognitoUser.forgotPassword({
      onSuccess: () => function (result) {
      },
      onFailure: () => function (err) {
        callback.cognitoCallback(err.message, null);
      },
      inputVerificationCode() {
        callback.cognitoCallback(null, null);
      }
    });
  }

  confirmNewPassword(email: string, verificationCode: string, password: string, callback: CognitoCallback) {
    let userData = {
      Username: email,
      Pool: this.cognitoService.getUserPool()
    };

    let cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess: () => function (result) {
        callback.cognitoCallback(null, result);
      },
      onFailure: () => function (err) {
        callback.cognitoCallback(err.message, null);
      }
    });
  }

  logout() {
    console.log("Logging out");
    this.cognitoService.getCurrentUser().signOut();
  }

  isAuthenticated(callback: LoggedInCallback) {
    if (!callback)
      throw ("Callback in isAuthenticated() cannot be null");

    let cognitoUser = this.cognitoService.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          console.log("Couldn't get the session: " + err, err.stack);
          callback.isLoggedInCallback(err, false, null);
        }
        else {
          console.log("Session is valid: " + session.isValid());
          callback.isLoggedInCallback(err, session.isValid(), cognitoUser.getUsername());
        }
      });
    } else {
      callback.isLoggedInCallback("Can't retrieve the CurrentUser", false, null);
    }
  }

  setAWSConfig(result: any) {
    this.cognitoService.setAWSConfig(result);
  }



  /** USER PARAMETERS */

  getParameters(callback: Callback) {   // NON DEVO PASSARE UNA CALLBACK MA LA CLASSE CHE IMPLEMENTA L'interfaccia "Callback" contenente un metodo denominato "callbackWithParam"
    let cognitoUser = this.cognitoService.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err)
          console.log("Couldn't retrieve the user");
        else {
          cognitoUser.getUserAttributes(function (err, result) {
            if (err) {
              console.log("in getParameters: " + err);
            } else {
              callback.callbackWithParam(result);
            }
          });
        }

      });
    } else {
      callback.callbackWithParam(null);
    }


  }

  getParameter(parameterName: string) {
    console.log(this.parametroRicevuto);
    let cognitoUser = this.cognitoService.getCurrentUser();
    let sub = this.parametroRicevuto;
    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err)
          console.log("Couldn't retrieve the user");
        else {
          cognitoUser.getUserAttributes(function (err, result) {    // RESULT È UN ARRAY DI CognitoUserAttribute
            if (err) {
              console.log("in getParameter: " + err);
            } else {
              for(let i of result){
                if(i.getName() === parameterName){
                  sub.next(i.getValue());
                }
              }
            }
          });
        }

      });
    } else {
      console.log("Congito User is NUll");
    }

  }



  /** USER REGISTRATIONS */

  register(user: RegistrationUser, callback: CognitoCallback): void {

    let userPool = this.cognitoService.getUserPool();

    let attributeList = [];

    let dataEmail = {
      Name: 'email',
      Value: user.email
    };

    let name = {
      Name: 'name',
      Value: user.name
    };

    let family_name = {
      Name: 'family_name',
      Value: user.family_name
    };

    let apikey = {
      Name: 'custom:apikey',
      Value: user.apikey
    };

    let attributeEmail = new CognitoUserAttribute(dataEmail);
    let attributeName = new CognitoUserAttribute(name);
    let attributeApikey = new CognitoUserAttribute(apikey);
    let attributeFamilyName = new CognitoUserAttribute(family_name);

    attributeList.push(attributeEmail);
    attributeList.push(attributeName);
    attributeList.push(attributeFamilyName);
    attributeList.push(attributeApikey);

    userPool.signUp(user.email, user.password, attributeList, null, function (err, result) {
      if (err) {
        console.log("ERRORE SIGNUP");
        console.log(err);
        console.log(err.message);
        callback.cognitoCallback(err.message, null);
      } else {
        console.log("Risultato signup:");
        console.log(result);
        callback.cognitoCallback(null, result);
      }
    });
  }

  confirmRegistration(email: string, confirmationCode: string, callback: ConfirmUserCallback): void {

    let userData = {
      Username: email,
      Pool: this.cognitoService.getUserPool()
    };

    let cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
      if (err) {
        callback.confirmUserCallback(err.message, null);
      } else {
        callback.confirmUserCallback(null, result);
      }
    });
  }

  resendCode(email: string, callback: CognitoCallback): void {
    let userData = {
      Username: email,
      Pool: this.cognitoService.getUserPool()
    };

    let cognitoUser = new CognitoUser(userData);

    cognitoUser.resendConfirmationCode(function (err, result) {
      if (err) {
        callback.cognitoCallback(err.message, null);
      } else {
        callback.cognitoCallback(null, result);
      }
    });
  }


}
