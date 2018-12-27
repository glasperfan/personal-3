import { Component, OnInit } from "@angular/core";
import * as moment from 'moment';
import { ICON } from '../../../models/Icon';
import { IHistoricalRideWithProduct } from "../../../models/RideHistory";
import { EmissionsService, EPAStandardEmissionsProps, EPAStandardEmissionsService } from "../../../services/emissions.service";
import { UberApiService } from "../../../services/uber-api.service";

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IHistoricalRideWithProduct[];
    componentLoading: boolean;
    emissionsService: EmissionsService<EPAStandardEmissionsProps>;
    ICON = ICON;

    constructor(private api: UberApiService) {
        this.componentLoading = false;
        this.emissionsService = new EPAStandardEmissionsService();
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getAllRides().subscribe(rides => {
            this.rideHistory = this.sortRides(rides);
            this.componentLoading = false;
        });
    }

    calculate(ride: IHistoricalRideWithProduct) {
        return Math.round(this.emissionsService.calculateEmissions({ miles: ride.distance, isSharedRide: ride.product.shared }));
    }

    calculateTime(startTime: number, endTime: number) {
        return moment.duration(moment(endTime).diff(startTime), 'seconds').humanize();
    }

    formatDistance(distance: number): string {
        return `${distance.toFixed(2)} miles`;
    }

    formatRideTime(startTime: number) {
        return moment.unix(startTime).format('DD MMM YYYY h:mma');
    }

    get sidebarHeight(): number {
        return window.innerHeight - document.getElementById('navbar').offsetHeight;
    }

    sortRides(rides: IHistoricalRideWithProduct[]): IHistoricalRideWithProduct[] {
        return rides.sort((a: IHistoricalRideWithProduct, b: IHistoricalRideWithProduct) => b.start_time - a.start_time);
    }
}
