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

    protected selectedUnit: EmissionsUnits = 'pounds';
    
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
