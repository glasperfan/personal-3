import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IAggregateRow, RideStatsAggregator, RideStatsInterval, RideStatsService } from '../../../services/ride-stats.service';
import { IHistoricalRide, UberApiService } from '../../../services/uber-api.service';
import { unsubscribe } from '../../../utils';
import { MatSelectChange } from '@angular/material/select';

declare const google: any;

interface IGoogleChartLabel {
    label: string;
    id: string;
    type: string;
}

@Component({
    selector: 'p3-uber-dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: [ 'dashboard.component.less' ]
})
export class DashboardComponent implements OnInit {
    
    rides: IHistoricalRide[];

    componentLoading: boolean = false;
    
    defaultSelectedInterval: RideStatsInterval = 'week';
    selectedInterval: RideStatsInterval = this.defaultSelectedInterval;

    defaultSelectedAggregator: RideStatsAggregator = 'rideCount';
    selectedAggregator: RideStatsAggregator = this.defaultSelectedAggregator;
    
    dataSubscription: Subscription;

    chart: any;
    chartLabels: IGoogleChartLabel[];
    chartOptions: any;
    dataTable: any;
    
    constructor(private api: UberApiService, private stats: RideStatsService) { }
    
    ngOnInit(): void {
        this.stats.onStatsReady.subscribe(ready => {
            this.componentLoading = !ready;
            if (ready) {
                this.retrieveStatsBasedOnCurrentSelection();
            }
        });
        this.api.getAllRides().pipe(take(1)).subscribe(result => this.stats.rides = result.rides);
    }

    onIntervalSelection(selectionChange: MatSelectChange) {
        this.retrieveStatsBasedOnCurrentSelection();
    }

    onAggregatorSelection(selection: MatSelectChange) {
        this.retrieveStatsBasedOnCurrentSelection();
    }

    retrieveStatsBasedOnCurrentSelection(): void {
        unsubscribe(this.dataSubscription);
        this.dataSubscription = this.stats
                    .getAggregationsBy(this.selectedAggregator, this.selectedInterval)
                    .subscribe(aggregateRows => this.updateChart(aggregateRows));
    }

    updateChart(rows: IAggregateRow[]) {
        if (!this.chart) {
            this.drawChart(rows);
        } else {
            this.updateChartData(rows);
            this.chart.draw(this.dataTable, this.chartOptions);
        }
    }

    drawChart(rows: IAggregateRow[]) {
        google.charts.load('current', { 'packages' : [ 'corechart' ] });
        google.charts.setOnLoadCallback(() => {
            this.updateChartData(rows);

            this.chartOptions = {
                title: 'Your Footprint',
                curveType: 'function',
                width: 1000,
                height: 400,
                chartArea:{
                },
                hAxis: { 
                    direction: -1,
                    slantedText: true,
                    minTextSpacing: 50
                },
                animation: {
                    startup: true,
                    duration: 1000,
                    easing: 'inAndOut'
                },
                legend: { position: 'bottom' }
            };

            this.chart = new google.visualization.LineChart(document.getElementById('main-chart'));
            this.chart.draw(this.dataTable, this.chartOptions);
        });
    }

    updateChartData(rows: IAggregateRow[]): void {
        this.chartLabels = [
            { label: this.stats.IntervalOptions[this.selectedInterval], id: this.selectedInterval, type: 'string' },
            { label: this.stats.AggregatorOptions[this.selectedAggregator], id: this.selectedAggregator, type: 'number' }
        ];
        this.dataTable = google.visualization.arrayToDataTable([
            this.chartLabels,
            ...rows
        ], false);
    }
}