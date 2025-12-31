import { Component } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { LoginService, CommonService } from 'src/common'

import { faGithub, faGitlab, faGoogle, faMicrosoft, faOpenid, IconDefinition } from '@fortawesome/free-brands-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'

interface Provider {
  id: string
  name: string
  icon: string
  cls: string
}

// Map icon names from backend to FontAwesome icons
const iconMap: Record<string, IconDefinition> = {
  github: faGithub,
  gitlab: faGitlab,
  google: faGoogle,
  microsoft: faMicrosoft,
  openid: faOpenid,  // Used for generic OIDC providers (Authentik, Authelia, Keycloak, etc.)
  key: faKey,  // Used for Auth0 and other providers without brand icons
}

@Component({
  selector: 'login',
  templateUrl: './login.component.pug',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loggedIn: any
  ready = false
  providers: Array<Provider & { faIcon: IconDefinition }> = []

  constructor (
    private http: HttpClient,
    private loginService: LoginService,
    public commonService: CommonService,
  ) { }

  async ngOnInit () {
    // Fetch available providers from backend
    try {
      const providers = await this.http.get<Provider[]>('/api/1/auth/providers').toPromise()
      this.providers = (providers || []).map(p => ({
        ...p,
        faIcon: iconMap[p.icon] || faKey,
      }))
    } catch {
      // Fallback to empty list if API fails
      this.providers = []
    }

    await this.loginService.ready$.toPromise()
    this.loggedIn = !!this.loginService.user
    this.ready = true
  }
}
