import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { LoginService } from 'src/common'

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.pug',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  username = ''
  password = ''
  errorMessage = ''

  constructor (private loginService: LoginService, private router: Router) {}

  login (): void {
    this.loginService.login(this.username, this.password).then(
      (_) => {
        this.router.navigate(['/app'])
      }
    ).catch(
      (error) => {
        this.errorMessage = error.error?.error || 'Login failed. Please check your credentials.'
        console.error('Login error:', error)
      }
    )
  }
}
