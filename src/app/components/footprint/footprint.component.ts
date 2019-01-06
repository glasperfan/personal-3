import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UberAuthService } from '../../services/uber-auth.service';

@Component({
    selector: 'p3-footprint',
    templateUrl: 'footprint.component.html',
    styleUrls: [ 'footprint.component.less' ]
})
export class FootprintComponent implements OnInit {
    public copyright: string;
    
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public uberAuth: UberAuthService) { }

    ngOnInit() {
        if (!this.uberAuth.isCurrentUserAuthorized) {
            this.parseAuthCodeFromQueryParams();
        }
    }

    parseAuthCodeFromQueryParams(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            const authCode = params['code'];
            if (authCode) {
                this.authorizeUberAPI(authCode);
            }
        });
    }

    authorizeUberAPI(authCode: string): void {
        this.uberAuth.authorize(authCode).subscribe(isTokenAcquired => {
            if (isTokenAcquired) {
                this.router.navigateByUrl('/footprint');
            } else {

            }
        });
    }
}
