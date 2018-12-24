import { Component, OnInit } from '@angular/core';
import { IHistoricalRide, UberApiService } from '../../../services/uber-api.service';
import { groupBy, forOwn } from 'lodash-es';
import * as moment from 'moment';

declare const google: any;

@Component({
    selector: 'p3-uber-dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: [ 'dashboard.component.less' ]
})
export class DashboardComponent implements OnInit {
    
    rides: IHistoricalRide[];
    
    constructor(private api: UberApiService) { }
    
    ngOnInit(): void {
        this.api.getAllRides().subscribe(rides => {
            this.rides = rides.rides;
            this.createChart(this.rides);
        })
    }

    createChart(rides: IHistoricalRide[]) {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);
        let groupedResults = groupBy(rides, (r: IHistoricalRide) => moment.unix(r.start_time).startOf('month').format("MMM 'YY"));
        console.log(groupedResults);
        function drawChart() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Month');
            data.addColumn('number', 'Ride Count');
            const rows = [];
            forOwn(groupedResults, (value: IHistoricalRide[], key: string) => rows.push([value[0].start_time, key, value.length]));
            const sortedRows = rows.sort((a, b) => b[0] - a[0]).map(v => v.slice(1));
            data.addRows(sortedRows);

            var options = {
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

        var chart = new google.visualization.LineChart(document.getElementById('main-chart'));

        chart.draw(data, options);
      }
    }
}