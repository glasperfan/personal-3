import { Component } from "@angular/core";
import { UberAuthService } from "../../../services/uber-auth.service";


@Component({
    selector: 'p3-uber-navbar',
    templateUrl: 'navbar.component.html',
    styleUrls: [ 'navbar.component.less' ]
})
export class NavbarComponent {
    constructor (public auth: UberAuthService) { }
}