import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UberAuthService } from '../../services/uber-auth.service';

@Component({
    selector: 'p3-footprint',
    templateUrl: 'footprint.component.html',
    styleUrls: [ 'footprint.component.less' ]
})
export class FootprintComponent implements OnInit {
    public copyright: string;

    constructor(private activatedRoute: ActivatedRoute, private uberAuthService: UberAuthService) { }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(params => {
            const authCode = params['code'];
            if (authCode) {
                this.uberAuthService.exchangeAuthCodeForToken(authCode).subscribe();
            }
        });
    }

    getUberAuthUrl() {
        return this.uberAuthService.uberAuthorizationUrl;
    }
}
