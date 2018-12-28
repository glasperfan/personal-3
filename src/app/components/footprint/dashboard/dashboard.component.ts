import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IHistoricalRideWithProduct } from '../../../models/RideHistory';
import { IAggregateRow, RideStatsAggregator, RideStatsInterval, RideStatsService, IGoogleChartLabel } from '../../../services/ride-stats.service';
import { UberApiService } from '../../../services/uber-api.service';
import { unsubscribe } from '../../../utils';

declare const google: any;

@Component({
    selector: 'p3-uber-dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: [ 'dashboard.component.less' ]
})
export class DashboardComponent implements OnInit {
    
    rides: IHistoricalRideWithProduct[];

    componentLoading: boolean = false;
    
    defaultSelectedInterval: RideStatsInterval = 'week';
    selectedInterval: RideStatsInterval = this.defaultSelectedInterval;

    defaultSelectedAggregator: RideStatsAggregator = 'rideCount';
    selectedAggregator: RideStatsAggregator = this.defaultSelectedAggregator;
    
    dataSubscription: Subscription;

    chart: any;
    chartHeight = 400;
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
        this.api.getAllRideHistory().pipe(take(1)).subscribe(rides => this.stats.rides = rides);
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
        google.charts.load('current', { 'packages' : [ 'line' ] });
        google.charts.setOnLoadCallback(() => {
            this.updateChartData(rows);

            this.chartOptions = {
                chart: {
                    title: 'Your Footprint',
                    subtitle: 'Select from the options to the right to examine your ride history by different metrics.'
                },
                explorer: { axis: 'horizontal' },
                curveType: 'function',
                width: 850,
                height: this.chartHeight,
                chartArea:{
                    left: 75,
                    width: 775,
                    top: 20
                },
                hAxis: { 
                    slantedText: true,
                    minTextSpacing: 50
                },
                animation: {
                    startup: true,
                    duration: 1000,
                    easing: 'inAndOut'
                },
                legend: { position: 'left' }
            };

            this.chart = new google.charts.Line(document.getElementById('main-chart'));
            this.chart.draw(this.dataTable, google.charts.Line.convertOptions(this.chartOptions));
        });
    }

    updateChartData(rows: IAggregateRow[]): void {
        this.chartLabels = [
            { label: this.stats.IntervalOptions[this.selectedInterval], id: this.selectedInterval, type: 'string' },
            ...this.stats.columns(this.selectedAggregator)
        ];
        this.dataTable = google.visualization.arrayToDataTable([
            this.chartLabels,
            ...rows
        ], false);
    }

    get componentHeight(): number {
        return window.innerHeight - document.getElementById('navbar').offsetHeight;
    }
}