import { Component, OnInit } from "@angular/core";
import * as moment from 'moment';
import { map } from "rxjs/operators";
import { ICON } from '../../../models/Icon';
import { EmissionsService, EPAStandardEmissionsProps, EPAStandardEmissionsService } from "../../../services/emissions.service";
import { IHistoricalRide, UberApiService } from "../../../services/uber-api.service";

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IHistoricalRide[];
    componentLoading: boolean;
    emissionsService: EmissionsService<EPAStandardEmissionsProps>;
    ICON = ICON;

    constructor(private api: UberApiService) {
        this.componentLoading = false;
        this.emissionsService = new EPAStandardEmissionsService();
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getAllRides().pipe(
            map(response => response.rides.slice(6))
        ).subscribe(rides => {
            this.rideHistory = rides;
            this.componentLoading = false;
        });
    }

    calculate(ride: IHistoricalRide) {
        return Math.round(this.emissionsService.calculateEmissions({ miles: ride.distance }));
    }

    calculateTime(startTime: number, endTime: number) {
        return moment.duration(moment(endTime).diff(startTime), 'seconds').humanize();
    }

    formatDistance(distance: number): string {
        return `${distance.toFixed(2)} miles`;
    }

    get sidebarHeight(): number {
        return window.innerHeight - document.getElementById('navbar').offsetHeight;
    }
}
