import { Component, OnInit } from "@angular/core";
import * as moment from 'moment';
import { 
    EmissionsService,
    EPAStandardEmissionsProps,
    EPAStandardEmissionsService
} from "../../../services/emissions.service";
import { IHistoricalRide, IRideHistoryResponse, UberApiService } from "../../../services/uber-api.service";
import { ICON } from '../../../models/Icon';

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IRideHistoryResponse;
    componentLoading: boolean;
    emissionsService: EmissionsService<EPAStandardEmissionsProps>;
    ICON = ICON;

    constructor(private api: UberApiService) {
        this.componentLoading = false;
        this.emissionsService = new EPAStandardEmissionsService();
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getRideHistory().subscribe(rides => {
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

    get sidebarHeight(): number {
        return window.innerHeight - document.getElementById('navbar').offsetHeight;
    }
}
