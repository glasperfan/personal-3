import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { groupBy, mapValues, values, uniq, keyBy, invert } from "lodash-es";
import * as moment from 'moment';
import { EPAStandardEmissionsService } from "./emissions-epa.service";
import { map } from "rxjs/operators";
import { IHistoricalRideWithProduct } from "../models/RideHistory";

export type RideStatsAggregator = 'rideCount' | 'totalEmissions' | 'productType';
export type RideStatsInterval = 'week' | 'month' | 'year';
// collections of rides grouped by times
type AggregateRides = { [time: string]: (IHistoricalRideWithProduct | IPlaceholderRide)[] };
// collections of rows grouped by interval
type AggregateRows = { [I in RideStatsInterval]: IAggregateRow[] };
// collections of rides grouped by times grouped by interval
type Aggregations = { [I in RideStatsInterval]: AggregateRides };
type Trends = { [A in RideStatsAggregator]: { [I in RideStatsInterval]: ITrend }};

export type IAggregateRow = any[];
export type IPlaceholderRide = { start_time: number, placeholder: true };

export interface IGoogleChartLabel {
    label: string;
    id: string;
    type: string;
}

export interface ITrend {
    thisInterval: number;
    lastInterval: number;
}

@Injectable()
export class RideStatsService {
    
    public readonly IntervalOptions: { [I in RideStatsInterval]: string } = {
        week: 'Weekly',
        month: 'Monthly',
        year: 'Yearly'
    };

    public readonly IntervalsInOrder: RideStatsInterval[] = ['week', 'month', 'year']; 

    public readonly AggregatorOptions: { [I in RideStatsAggregator]: string } = {
        rideCount: 'By Ride Count',
        totalEmissions: 'By Total Emissions',
        productType: 'By Product Type'
    };

    public readonly TrendTitles: { [I in RideStatsAggregator]: string } = {
        rideCount: 'Ride Count',
        totalEmissions: 'Total Emissions',
        productType: 'Product Type'
    }

    private readonly UberLabels = {
        'uberx': 'Uber X',
        'rideshare': 'Ride Share',
        'uberxl': 'UberXL',
        'uberblack': 'Uber Black'
    };
    
    private readonly EMPTY_AGGREGATES: AggregateRows = { } as AggregateRows;
    private readonly weekFormat = "MMM Do 'YY";
    private readonly monthFormat = "MMM 'YY";
    private readonly yearFormat = "YYYY";
    
    private _rides: BehaviorSubject<IHistoricalRideWithProduct[]> = new BehaviorSubject([]);  
    private _rides$: Observable<IHistoricalRideWithProduct[]>;
    private _onStatsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _onStatsReady$: Observable<boolean>;
    private _rideCountBy: BehaviorSubject<AggregateRows> = new BehaviorSubject(this.EMPTY_AGGREGATES);
    private _rideCountBy$: Observable<AggregateRows>;
    private _emissionsBy: BehaviorSubject<AggregateRows> = new BehaviorSubject(this.EMPTY_AGGREGATES);
    private _emissionsBy$: Observable<AggregateRows>;
    private _productTypeBy: BehaviorSubject<AggregateRows> = new BehaviorSubject(this.EMPTY_AGGREGATES);
    private _productTypeBy$: Observable<AggregateRows>;
    private _columns: { [A in RideStatsAggregator]: IGoogleChartLabel[] };
    private _trends: Trends;
    
    private groupedAggregates: Aggregations;


    constructor(private emissions: EPAStandardEmissionsService) {
        this._rides$ = this._rides.asObservable();
        this._onStatsReady$ = this._onStatsReady.asObservable();
        this._rideCountBy$ = this._rideCountBy.asObservable();
        this._emissionsBy$ = this._emissionsBy.asObservable();
        this._productTypeBy$ = this._productTypeBy.asObservable();
        this._columns = {
            productType: [],
            totalEmissions: [
                { label: this.AggregatorOptions['totalEmissions'], id: 'totalEmissions', type: 'number' }
            ],
            rideCount: [
                { label: this.AggregatorOptions['rideCount'], id: 'rideCount', type: 'number' }
            ]
        };
    }

    get rides$(): Observable<IHistoricalRideWithProduct[]> {
        return this._rides$;
    }
    
    get rides(): IHistoricalRideWithProduct[] {
        return this._rides.getValue();
    }

    set rides(rides: IHistoricalRideWithProduct[]) {
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
     *  Compare this __ against last __ and all time. (week/month/year) 
     * What is the impact?
     *  How does my emissions from last month of Uber rides compare to a one-way flight to London?
     * 
     * Eagerly calculate all values based on incoming rides.
     * Always sort from earliest to latest.
     */

    getAggregationsBy(aggregator: RideStatsAggregator, interval: RideStatsInterval): Observable<IAggregateRow[]> {
        if (aggregator === 'rideCount') return this.getRideCountBy$(interval);
        if (aggregator === 'totalEmissions') return this.getCarbonEmissionsBy$(interval);
        if (aggregator === 'productType') return this.getProductTypeBy$(interval);
        throw new Error('invalid aggregation option');
    }

    getTrendsBy(aggregator: RideStatsAggregator): { [I in RideStatsInterval]: ITrend } {
        return this._trends[aggregator];
    }

    columns(A: RideStatsAggregator): IGoogleChartLabel[] {
        return this._columns[A];
    }

    private getAggregations(aggregator: RideStatsAggregator): AggregateRows {
        if (aggregator === 'rideCount') return this.getRideCountBy();
        if (aggregator === 'totalEmissions') return this.getCarbonEmissionsBy();
        if (aggregator === 'productType') return this.getProductTypeBy();
        throw new Error('invalid aggregation option');
    }

    private getRideCountBy(): AggregateRows {
        return this._rideCountBy.getValue();
    }
    
    private getRideCountBy$(interval: RideStatsInterval): Observable<IAggregateRow[]> {
        return this._rideCountBy$.pipe(map(byInterval => byInterval[interval]));
    }

    private getCarbonEmissionsBy(): AggregateRows {
        return this._emissionsBy.getValue();
    }

    private getCarbonEmissionsBy$(interval: RideStatsInterval): Observable<IAggregateRow[]>{
        return this._emissionsBy$.pipe(map(byInterval => byInterval[interval]));
    }

    private getProductTypeBy(): AggregateRows {
        return this._productTypeBy.getValue();
    }

    private getProductTypeBy$(interval: RideStatsInterval): Observable<IAggregateRow[]> {
        return this._productTypeBy$.pipe(map(byInterval => byInterval[interval]));
    }

    private setRideCountBy(rows: AggregateRows) {
        this._rideCountBy.next(rows);
    }

    private setCarbonEmissionsBy(rows: AggregateRows) {
        this._emissionsBy.next(rows);
    }

    private setProductTypeBy(rows: AggregateRows) {
        this._productTypeBy.next(rows);
    }

    private onNewRideData(): void {
        this.calculateGroupBy();
        this.calculateRideCountBy();
        this.calculateCarbonEmissionsBy();
        this.calculateProductTypeBy();
        this.calculateTrends();
    }

    /**
     * Note that no collections of rides are sorted here. Sort happens after the reduce.
     */
    private calculateGroupBy(): void {
        const groupByWeek: AggregateRides = groupBy(this.rides, (r: IHistoricalRideWithProduct) => moment.unix(r.start_time).startOf('isoWeek').format(this.weekFormat));
        const groupByMonth: AggregateRides = groupBy(this.rides, (r: IHistoricalRideWithProduct) => moment.unix(r.start_time).startOf('month').format(this.monthFormat));
        const groupByYear: AggregateRides = groupBy(this.rides, (r: IHistoricalRideWithProduct) => moment.unix(r.start_time).startOf('year').format(this.yearFormat));
        
        let earliest_t = this.rides[0].start_time;
        this.rides.forEach(r => {
            if (r.start_time < earliest_t) earliest_t = r.start_time;
        });

        const earliest = moment.unix(earliest_t);
        const latest = moment(new Date());

        for (var m = moment(earliest).startOf('isoWeek'); m.isBefore(latest); m.add(1, 'week')) {
            const wf = m.format(this.weekFormat);
            if (!groupByWeek[wf]) {
                groupByWeek[wf] = [{ start_time: m.unix(), placeholder: true }];
            }
            const mv = moment(m).startOf('month');
            const mf = mv.format(this.monthFormat);
            if (!groupByMonth[mf]) {
                groupByMonth[mf] = [{ start_time: mv.unix(), placeholder: true }];
            }
            const yv = moment(m).startOf('year');
            const yf = yv.format(this.yearFormat);
            if (!groupByYear[yf]) {
                groupByYear[yf] = [{ start_time: yv.unix(), placeholder: true }];
            }
        }

        this.groupedAggregates = {
            'week': groupByWeek,
            'month': groupByMonth,
            'year': groupByYear
        };
    }

    private calculateRideCountBy(): void {
        const aggFn = (rides: IHistoricalRideWithProduct[], key: string): IAggregateRow => 
            'placeholder' in rides[0] 
            ? [rides[0].start_time, key, 0]
            : [rides[0].start_time, key, rides.length];
        const rideCountByWeek: IAggregateRow[] = values(mapValues(this.groupedAggregates.week, aggFn));
        const rideCountByMonth: IAggregateRow[] = values(mapValues(this.groupedAggregates.month, aggFn));
        const rideCountByYear: IAggregateRow[] = values(mapValues(this.groupedAggregates.year, aggFn));
        this.setRideCountBy({
            week: this.sortFn(rideCountByWeek),
            month: this.sortFn(rideCountByMonth),
            year: this.sortFn(rideCountByYear)
        });
    }

    private calculateCarbonEmissionsBy(): void {
        const sumFn = (total: number, el: number): number => total + el;
        const emissionsFn = (rides: IHistoricalRideWithProduct[]): number => 
            rides.map(r => this.emissions.calculateEmissions({ miles: r.distance, isSharedRide: r.product.shared })).reduce(sumFn);
        const aggFn = (rides: IHistoricalRideWithProduct[], key: string): IAggregateRow => 
            'placeholder' in rides[0]
            ? [rides[0].start_time, key, 0]
            : [rides[0].start_time, key, emissionsFn(rides)]
        const emissionsByWeek = values(mapValues(this.groupedAggregates.week, aggFn));
        const emissionsByMonth = values(mapValues(this.groupedAggregates.month, aggFn));
        const emissionsByYear = values(mapValues(this.groupedAggregates.year, aggFn));
        this.setCarbonEmissionsBy({
            week: this.sortFn(emissionsByWeek),
            month: this.sortFn(emissionsByMonth),
            year: this.sortFn(emissionsByYear)
        });
    }

    private calculateProductTypeBy(): void {
        const allProducts = this.calculateUniqueProductTypes();
        const indexToProductMap: { [key: number]: string } = invert(keyBy(allProducts, (productName: string) => allProducts.indexOf(productName) + 2));
        const aggFn = (rides: IHistoricalRideWithProduct[], key: string): IAggregateRow => {
            const row: IAggregateRow = [rides[0].start_time, key].concat(allProducts.map(_ => 0));
            if ('placeholder' in rides[0]) {
                return row;
            }
            rides.forEach(r => { row[indexToProductMap[r.product.product_group]]++; });
            return row;
        }
        const productTypeByWeek = values(mapValues(this.groupedAggregates.week, aggFn));
        const productTypeByMonth = values(mapValues(this.groupedAggregates.month, aggFn));
        const productTypeByYear = values(mapValues(this.groupedAggregates.year, aggFn));
        this.setProductTypeBy({
            week: this.sortFn(productTypeByWeek),
            month: this.sortFn(productTypeByMonth),
            year: this.sortFn(productTypeByYear)
        });
    }

    private calculateUniqueProductTypes(): string[]  {
        const typeArr = uniq(this.rides.map(r => r.product.product_group));
        this._columns.productType = typeArr.map(t => ({ id: t, label: this.UberLabels[t], type: 'number' } as IGoogleChartLabel));
        return typeArr;
    }

    private calculateTrends() {
        this._trends = {
            productType: this.generateTrendForAggregate('productType'),
            rideCount: this.generateTrendForAggregate('rideCount'),
            totalEmissions: this.generateTrendForAggregate('totalEmissions')
        }
    }

    private generateTrendForAggregate(aggregator: RideStatsAggregator): ({ [I in RideStatsInterval]: ITrend }) {
        const agg = this.getAggregations(aggregator);
        return {
            week: this.generateTrend(agg.week),
            month: this.generateTrend(agg.month),
            year: this.generateTrend(agg.year)
        }
    }
    
    private generateTrend(rows: IAggregateRow[]): ITrend {
        // Rows are sorted so that the latest interval object is the last.
        // Choose row[1] because row[0] is the key.
        return {
            lastInterval: rows[rows.length - 2][1],
            thisInterval: rows[rows.length - 1][1]
        } as ITrend;
    }

    private sortFn = (rides: any[]): IAggregateRow[] => rides.sort((a, b) => a[0] - b[0]).map(v => v.slice(1) as IAggregateRow);
}
