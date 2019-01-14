import { Component, OnInit } from "@angular/core";
import * as moment from 'moment';
import { ICON } from '../../../models/Icon';
import { IHistoricalRideWithProduct } from "../../../models/RideHistory";
import { EPAStandardEmissionsProps, EPAStandardEmissionsService } from "../../../services/emissions-epa.service";
import { EmissionsService, EmissionsUnits } from "../../../services/emissions.service";
import { UberApiService } from "../../../services/uber-api.service";
import { roundRobin } from "../../../utils";
import { take } from "rxjs/operators";
import { sum } from "lodash-es";
const numeral = require('numeral');

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IHistoricalRideWithProduct[];
    rideEmissions: string[]; // an array is used so change detection is triggered when units are changed
    totals: {
        emissions: string; // with units
        rides: number;
    }
    componentLoading: boolean;
    emissionsService: EmissionsService<EPAStandardEmissionsProps>;
    ICON = ICON;

    private displayUnits: EmissionsUnits[] = ['grams', 'kilograms', 'pounds'];

    constructor(private api: UberApiService) {
        this.componentLoading = false;
        this.emissionsService = new EPAStandardEmissionsService();
        this.totals = { emissions: '--', rides: 0 };
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getRideHistory().pipe(take(1)).subscribe(rides => {
            this.rideHistory = this.sortRides(rides);
            this.totals = {
                emissions: this.calculateAllEmissions(rides),
                rides: rides.length
            }
            this.refreshEmissionsForRides();
            this.componentLoading = false;
        });
    }

    calculateAllEmissionsFn = (rides: IHistoricalRideWithProduct[]): number => sum(rides.map(this.calculateEmissionsFn))

    calculateEmissionsFn = (ride: IHistoricalRideWithProduct): number =>
        this.emissionsService.calculateEmissions({ miles: ride.distance, isSharedRide: ride.product.shared });

    formatEmissions = (raw: number, roundUp: boolean): string => numeral(raw).format(roundUp ? '0,0' : '0,0.00');

    calculateAllEmissions(rides: IHistoricalRideWithProduct[]): string {
        return this.formatEmissions(this.calculateAllEmissionsFn(rides), true);
    }

    calculateEmissions(ride: IHistoricalRideWithProduct): string {
        return this.formatEmissions(this.calculateEmissionsFn(ride), false);
    }

    refreshEmissionsForRides() {
        this.rideEmissions = this.rideHistory.map(r => this.calculateEmissions(r));
        this.totals.emissions = this.calculateAllEmissions(this.rideHistory);
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
