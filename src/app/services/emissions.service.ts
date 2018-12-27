export type EmissionsUnits = 'grams' | 'pounds' | 'kilograms';

const UnitsMap: { [U in EmissionsUnits]: string } = {
    grams: 'grams',
    pounds: 'lbs',
    kilograms: 'kg'
};

export abstract class EmissionsService<T> {
    protected converters: { [U in EmissionsUnits]: Function } = {
        grams: (grams: number) => grams,
        pounds: (grams: number): number => (grams * 0.00220462),
        kilograms: (grams: number): number => (grams / 1000)
    };

    protected selectedUnit: EmissionsUnits = 'grams';
    
    set units(unit: EmissionsUnits) {
        this.selectedUnit = unit;
    }

    get units(): EmissionsUnits {
        return this.selectedUnit;
    }

    get displayUnits(): string {
        return UnitsMap[this.selectedUnit];
    }

    abstract calculateEmissions(info: T): number;
    
    protected convertToUnits(grams: number) {
        return this.converters[this.selectedUnit](grams);
    }
}

export interface EPAStandardEmissionsProps {
    miles: number;
    isSharedRide: boolean;
}

export class EPAStandardEmissionsService extends EmissionsService<EPAStandardEmissionsProps> {
    private readonly gramsPerMile = 170;
    
    /**
     *  Source: https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle
     *  "The average passenger vehicle emits about 404 grams of CO2 per mile."
     * @param info 
     */    
    calculateEmissions(info: EPAStandardEmissionsProps): number {
        let base = info.miles * this.gramsPerMile;
        base = info.isSharedRide ? base / 2 : base;
        return this.convertToUnits(base);
    }
}