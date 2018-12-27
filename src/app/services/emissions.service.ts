import { Injectable } from "@angular/core";

export interface EmissionsService<T> {
    calculateEmissions(info: T): number;
}

export interface EPAStandardEmissionsProps {
    miles: number;
    isSharedRide: boolean;
}

@Injectable()
export class EPAStandardEmissionsService implements EmissionsService<EPAStandardEmissionsProps> {
    private readonly gramsPerMile = 170;
    
    /**
     *  Source: https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle
     *  "The average passenger vehicle emits about 404 grams of CO2 per mile."
     * @param info 
     */    
    calculateEmissions(info: EPAStandardEmissionsProps): number {
        const base = info.miles * this.gramsPerMile;
        return info.isSharedRide ? base / 2 : base;
    }
    
}