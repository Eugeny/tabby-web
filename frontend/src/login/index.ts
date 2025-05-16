/* eslint-disable @typescript-eslint/no-extraneous-class */
import { NgModule } from '@angular/core'
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NgxImageZoomModule } from 'ngx-image-zoom'

import { LoginComponent } from './components/login.component'
import { LoginFormComponent } from './components/login-form/login-form.component' // Add this line
import { CommonAppModule, LoginService } from 'src/common'

const ROUTES = [
  {
    path: '',
    component: LoginComponent,
  },
]

@NgModule({
  imports: [
    CommonAppModule,
    CommonModule,
    FormsModule,
    NgbNavModule,
    FontAwesomeModule,
    NgxImageZoomModule,
    RouterModule.forChild(ROUTES),
  ],
  declarations: [
    LoginComponent,
    LoginFormComponent // Add this line
  ],
  providers: [
    LoginService // Ensure LoginService is provided if not already
  ]
})
export class LoginModule { }
