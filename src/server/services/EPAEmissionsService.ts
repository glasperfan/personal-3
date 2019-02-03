import { EmissionsService } from "./EmissionsService";

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