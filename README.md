# Template App Ionic (Amazon Cognito)
Basic [IONIC](https://ionicframework.com/) template which uses [Amazon Cognito](https://aws.amazon.com/cognito/).

With this template all the authentication services are already implemented. 

# Getting Started

* Before starting you have to insert your [User Pool's config](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
  inside the file [CONFIG](/src/CONFIG/CONFIG.ts)

* Edit the file [cognito.service.ts](/src/providers/AWS/cognito.service.ts) on the method **setAWSConfig**
  on the commented line 'EDIT THE KEY'.
  
To install the node modules type:
```
npm install
```
To start the application on your local browser type:
```
ionic serve
```

## Authors

* **Lorenzo Catalli** - *Initial work* - [LorCat](https://github.com/LorCat9)

## Company

* **Anthea** - [website](http://www.gruppoanthea.it)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

