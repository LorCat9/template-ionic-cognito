import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResendCodePage } from './resend-code';

@NgModule({
  declarations: [
    ResendCodePage,
  ],
  imports: [
    IonicPageModule.forChild(ResendCodePage),
  ],
})
export class ResendCodePageModule {}
