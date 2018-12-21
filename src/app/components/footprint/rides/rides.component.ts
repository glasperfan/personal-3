import { Component, OnInit } from "@angular/core";
import { IRideHistoryResponse, UberApiService, IHistoricalRide } from "../../../services/uber-api.service";

@Component({
    selector: 'p3-uber-rides',
    templateUrl: 'rides.component.html',
    styleUrls: [ 'rides.component.less' ]
})
export class RidesComponent implements OnInit {
    
    rideHistory: IRideHistoryResponse;
    componentLoading: boolean;

    constructor(private api: UberApiService) {
        this.componentLoading = false;
    }
    
    ngOnInit(): void {
        this.componentLoading = true;
        this.api.getRideHistory().subscribe(rides => {
            this.rideHistory = rides;
            this.componentLoading = false;
        });
    }

    calculate(ride: IHistoricalRide) {
        return Math.ceil(ride.distance);
    }

    calculateTime(startTime: number, endTime: number) {
        return endTime - startTime;
    }
}
