/**
 * File di Configurazione
 * */

// configurazioni Cognito
export const _REGION = "";
export const _IDENTITY_POOL_ID = "";
export const _USER_POOL_ID = "";
export const _CLIENT_ID = "";
export const _POOL_DATA = {
    UserPoolId: _USER_POOL_ID,
    ClientId: _CLIENT_ID
};
export const _MIN_PSW_LENGTH = 8;   // To be choosen on Cognito Console

// general
export const _MESSAGE_LOADER = "Please wait...";

// pagina Home

// pagina Login
export const _ERROR_INSERIMENTO_DATI_LOGIN = "Devono essere completati tutti i campi";

// pagina Register
export const _ERROR_LICENZA_NON_VALIDA = "Licenza non valida";
export const _ALERT_CC_TITLE = "Codice Conferma";
export const _ALERT_CC_SUBTITLE = "Inserisci il codice di conferma che è stato inviato alla mail data (controlla anche nello spam/promozioni)";
export const _ALERT_ERROR_CAMPI_TITLE = "Ricontrolla i campi";
export const _ALERT_ERROR_CAMPI_SUBTITLE = "Campo vuoto o ricontrolla la nuova password";



// pagina Resend Code

// pagina Forgot Password

