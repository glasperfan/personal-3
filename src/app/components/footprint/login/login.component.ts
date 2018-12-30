import { Component } from "@angular/core";
import { UberAuthService } from "../../../services";

@Component({
    selector: 'p3-footprint-login',
    templateUrl: 'login.component.html',
    styleUrls: [ 'login.component.less' ]
})
export class FootprintLoginComponent {
    constructor (public auth: UberAuthService) { }
}