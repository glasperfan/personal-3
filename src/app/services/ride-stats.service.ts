import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { IHistoricalRide } from "./uber-api.service";
import { groupBy, mapValues, values } from "lodash-es";
import * as moment from 'moment';
import { EPAStandardEmissionsService } from "./emissions.service";
import { map } from "rxjs/operators";

export type RideStatsAggregator = 'rideCount' | 'totalEmissions';
export type RideStatsInterval = 'week' | 'month' | 'year';
// collections of rides grouped by times
type AggregateRides = { [time: string]: IHistoricalRide[] };
// collections of rows grouped by interval
type AggregateRows = { [I in RideStatsInterval]: IAggregateRow[] };
// collections of rides grouped by times grouped by interval
type Aggregations = { [I in RideStatsInterval]: AggregateRides };

export type ISortableRow = [number, string, number];
export type IAggregateRow = [string, number];


@Injectable()
export class RideStatsService {
    
    public readonly IntervalOptions: { [I in RideStatsInterval]: string } = {
        week: 'Weekly',
        month: 'Monthly',
        year: 'Yearly'
    };

    public readonly AggregatorOptions: { [I in RideStatsAggregator]: string } = {
        rideCount: 'By Ride Count',
        totalEmissions: 'By Total Emissions'
    };
    
    private readonly EMPTY_AGGREGATES: AggregateRows = { } as AggregateRows;
    
    private _rides: BehaviorSubject<IHistoricalRide[]> = new BehaviorSubject([]);  
    private _rides$: Observable<IHistoricalRide[]>;
    private _onStatsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _onStatsReady$: Observable<boolean>;
    private _rideCountBy: BehaviorSubject<AggregateRows> = new BehaviorSubject(this.EMPTY_AGGREGATES);
    private _rideCountBy$: Observable<AggregateRows>;
    private _emissionsBy: BehaviorSubject<AggregateRows> = new BehaviorSubject(this.EMPTY_AGGREGATES);
    private _emissionsBy$: Observable<AggregateRows>;

    private groupedAggregates: Aggregations;

    constructor(private emissions: EPAStandardEmissionsService) {
        this._rides$ = this._rides.asObservable();
        this._onStatsReady$ = this._onStatsReady.asObservable();
        this._rideCountBy$ = this._rideCountBy.asObservable();
        this._emissionsBy$ = this._emissionsBy.asObservable();
    }

    get rides$(): Observable<IHistoricalRide[]> {
        return this._rides$;
    }
    
    get rides(): IHistoricalRide[] {
        return this._rides.getValue();
    }

    set rides(rides: IHistoricalRide[]) {
        this._rides.next(rides);
        if (rides.length) {
            this._onStatsReady.next(false);
            this.onNewRideData();
            this._onStatsReady.next(true);
        }
    }

    get onStatsReady(): Observable<boolean> {
        return this._onStatsReady$;
    }

    /*
     * GroupBy: week, month, year
     * How many rides did I take by week/month/year?
     * What are my carbon emissions by week/month/year?
     * What are the trends?
     *  Average over all weeks/months/years vs last week/month/year?
     * What is the impact?
     *  How does my emissions from last month of Uber rides compare to a one-way flight to London?
     * 
     * Eagerly calculate all values based on incoming rides.
     * Always sort from earliest to latest.
     */

    getAggregationsBy(aggregator: RideStatsAggregator, interval: RideStatsInterval): Observable<IAggregateRow[]> {
        if (aggregator === 'rideCount') return this.getRideCountBy(interval);
        if (aggregator === 'totalEmissions') return this.getCarbonEmissionsBy(interval);
        throw new Error('invalid aggregation option');
    }
    
    private getRideCountBy(interval: RideStatsInterval): Observable<IAggregateRow[]> {
        return this._rideCountBy$.pipe(map(byInterval => byInterval[interval]));
    }

    private getCarbonEmissionsBy(interval: RideStatsInterval): Observable<IAggregateRow[]>{
        return this._emissionsBy$.pipe(map(byInterval => byInterval[interval]));
    }

    private setRideCountBy(rows: AggregateRows) {
        this._rideCountBy.next(rows);
    }

    private setCarbonEmissionsBy(rows: AggregateRows) {
        this._emissionsBy.next(rows);
    }

    private onNewRideData(): void {
        this.calculateGroupBy();
        this.calculateRideCountBy();
        this.calculateCarbonEmissionsBy();
    }

    /**
     * Note that no collections of rides are sorted here. Sort happens after the reduce.
     */
    private calculateGroupBy(): void {
        const groupByWeek: AggregateRides = groupBy(this.rides, (r: IHistoricalRide) => moment.unix(r.start_time).startOf('isoWeek').format("MMM Do 'YY"));
        const groupByMonth: AggregateRides = groupBy(this.rides, (r: IHistoricalRide) => moment.unix(r.start_time).startOf('month').format("MMM 'YY"));
        const groupByYear: AggregateRides = groupBy(this.rides, (r: IHistoricalRide) => moment.unix(r.start_time).startOf('year').format("YYYY"));
        this.groupedAggregates = {
            'week': groupByWeek,
            'month': groupByMonth,
            'year': groupByYear
        };
    }

    private calculateRideCountBy(): void {
        const aggFn = (rides: IHistoricalRide[], key: string): ISortableRow => [rides[0].start_time, key, rides.length];
        const sortFn = (rides: ISortableRow[]): IAggregateRow[] => rides.sort((a, b) => b[0] - a[0]).map(v => [v[1], v[2]] as IAggregateRow);
        const rideCountByWeek: ISortableRow[] = values(mapValues(this.groupedAggregates.week, aggFn));
        const rideCountByMonth: ISortableRow[] = values(mapValues(this.groupedAggregates.month, aggFn));
        const rideCountByYear: ISortableRow[] = values(mapValues(this.groupedAggregates.year, aggFn));
        this.setRideCountBy({
            'week': sortFn(rideCountByWeek),
            'month': sortFn(rideCountByMonth),
            'year': sortFn(rideCountByYear)
        });
    }

    private calculateCarbonEmissionsBy(): void {
        const sumFn = (total: number, el: number): number => total + el;
        const emissionsFn = (rides: IHistoricalRide[]): number => rides.map(r => this.emissions.calculateEmissions({ miles: r.distance })).reduce(sumFn);
        const aggFn = (rides: IHistoricalRide[], key: string): ISortableRow => [rides[0].start_time, key, emissionsFn(rides)]
        const sortFn = (rides: ISortableRow[]): IAggregateRow[] => rides.sort((a, b) => b[0] - a[0]).map(v => [v[1], v[2]] as IAggregateRow);
        const emissionsByWeek = values(mapValues(this.groupedAggregates.week, aggFn));
        const emissionsByMonth = values(mapValues(this.groupedAggregates.month, aggFn));
        const emissionsByYear = values(mapValues(this.groupedAggregates.year, aggFn));
        this.setCarbonEmissionsBy({
            'week': sortFn(emissionsByWeek),
            'month': sortFn(emissionsByMonth),
            'year': sortFn(emissionsByYear)
        });
    }
}
