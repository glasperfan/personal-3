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
                    direction: -1,
                    slantedText: true,
                    minTextSpacing: 50
                },
                animation: {
                    startup: true,
                    duration: 1000,
                    easing: 'inAndOut'
                },
                legend: { position: 'none' }
            };

            this.chart = new google.charts.Line(document.getElementById('main-chart'));
            this.chart.draw(this.dataTable, google.charts.Line.convertOptions(this.chartOptions));
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

    get componentHeight(): number {
        return window.innerHeight - document.getElementById('navbar').offsetHeight;
    }
}