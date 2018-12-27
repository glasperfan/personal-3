import { Component, OnInit } from "@angular/core";
import { keyBy } from "lodash-es";
import * as moment from 'moment';
import { ICON } from '../../../models/Icon';
import { IHistoricalRide } from "../../../models/RideHistory";
import { IRideProduct } from "../../../models/RideProduct";
import { EmissionsService, EPAStandardEmissionsProps, EPAStandardEmissionsService } from "../../../services/emissions.service";
import { UberApiService } from "../../../services/uber-api.service";

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IHistoricalRide[];
    rideProducts: { [productId: string]: IRideProduct };
    componentLoading: boolean;
    emissionsService: EmissionsService<EPAStandardEmissionsProps>;
    ICON = ICON;

    constructor(private api: UberApiService) {
        this.componentLoading = false;
        this.emissionsService = new EPAStandardEmissionsService();
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getAllRides().subscribe(response => {
            this.rideHistory = this.sortRides(response.rides);
            this.rideProducts = keyBy(response.products, (rp: IRideProduct) => rp.product_id);
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

    formatRideTime(startTime: number) {
        return moment.unix(startTime).format('DD MMM YYYY HH:mm:ss a');
    }

    formatProduct(product_id: string) {
        return this.rideProducts[product_id].display_name;
    }

    get sidebarHeight(): number {
        return window.innerHeight - document.getElementById('navbar').offsetHeight;
    }

    sortRides(rides: IHistoricalRide[]): IHistoricalRide[] {
        return rides.sort((a: IHistoricalRide, b: IHistoricalRide) => b.start_time - a.start_time);
    }
}
