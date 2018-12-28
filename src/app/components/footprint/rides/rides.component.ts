import { Component, OnInit } from "@angular/core";
import * as moment from 'moment';
import { ICON } from '../../../models/Icon';
import { IHistoricalRideWithProduct } from "../../../models/RideHistory";
import { EmissionsService, EPAStandardEmissionsProps, EPAStandardEmissionsService, EmissionsUnits } from "../../../services/emissions.service";
import { UberApiService } from "../../../services/uber-api.service";
import { roundRobin } from "../../../utils";

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IHistoricalRideWithProduct[];
    rideEmissions: string[]; // an array is used so change detection is triggered when units are changed
    componentLoading: boolean;
    emissionsService: EmissionsService<EPAStandardEmissionsProps>;
    ICON = ICON;

    private displayUnits: EmissionsUnits[] = ['grams', 'kilograms', 'pounds'];

    constructor(private api: UberApiService) {
        this.componentLoading = false;
        this.emissionsService = new EPAStandardEmissionsService();
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getAllRideHistory().subscribe(rides => {
            this.rideHistory = this.sortRides(rides);
            this.refreshEmissionsForRides();
            this.componentLoading = false;
        });
    }

    calculateEmissions(ride: IHistoricalRideWithProduct): string {
        const raw = this.emissionsService.calculateEmissions({ miles: ride.distance, isSharedRide: ride.product.shared });
        if (raw < 10) return raw.toPrecision(2);
        if (raw < 100) return raw.toPrecision(1);
        return Math.round(raw).toString();
    }

    refreshEmissionsForRides() {
        this.rideEmissions = this.rideHistory.map(r => this.calculateEmissions(r));
    }

    onEmissionsUnitChange() {
        this.emissionsService.units = roundRobin(this.displayUnits, this.displayUnits.indexOf(this.emissionsService.units));
        this.refreshEmissionsForRides();
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
