import { Component, OnInit } from "@angular/core";
import { UberAuthService } from "../../../services/uber-auth.service";
import { UberApiService } from "../../../services/uber-api.service";
import { take } from "rxjs/operators";
import { ICON } from "../../../models/Icon";

@Component({
    selector: 'p3-uber-navbar',
    templateUrl: 'navbar.component.html',
    styleUrls: [ 'navbar.component.less' ]
})
export class NavbarComponent implements OnInit {
    logoutText = 'Logout';
    placementStatus: string;
    ICON = ICON;

    constructor(public auth: UberAuthService, private uber: UberApiService) { }

    async ngOnInit() {
        this.uber.getPlacement()
            .pipe(take(1))
            .subscribe(response => this.placementStatus = this.formatPlacement(response.placement));
    }

    logout() {
        this.logoutText = 'Logging out...';
        this.auth.logout().subscribe(userIsLoggedOut => {
            if (userIsLoggedOut) {
                this.logoutText = 'Now redirecting...';
                window.location.href = this.auth.logoutUrl;
            } else {
                this.logoutText = 'Logout failed';
            }
        });
    }

    privacyPolicy() {
        window.location.href = this.auth.privacyPolicyUrl;
    }

    private formatPlacement(placement: number) {
        if (placement === 1) return '1st place';
        if (placement === 2) return '2nd place';
        if (placement === 3) return '3rd place';
        return `${placement}th place`;
    }
}