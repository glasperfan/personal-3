import { Component } from "@angular/core";
import { UberAuthService } from "../../../services/uber-auth.service";


@Component({
    selector: 'p3-uber-navbar',
    templateUrl: 'navbar.component.html',
    styleUrls: [ 'navbar.component.less' ]
})
export class NavbarComponent {
    logoutText = 'Logout';
    
    constructor (public auth: UberAuthService) { }

    logout() {
        this.logoutText = 'Logging out...';
        this.auth.logout().subscribe(userIsLoggedOut => {
            if (userIsLoggedOut) {
                this.logoutText = 'Now redirecting...';
                new Location().assign(this.auth.loginUrl);
            } else {
                this.logoutText = 'Logout failed';
            }
        });
    }
}