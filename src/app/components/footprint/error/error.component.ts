import { Input, Component } from "@angular/core";
import { IError, UberAuthService } from "../../../services/uber-auth.service";

@Component({
    selector: 'p3-error',
    templateUrl: 'error.component.html',
    styleUrls: [ 'error.component.less' ]
})
export class ErrorComponent {

    constructor(private auth: UberAuthService) { }

    @Input() error: IError;

    resetCookies() {
        this.auth.deleteUserCookies();
        window.location.href = '/footprint';
    }
}
