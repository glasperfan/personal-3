
export interface IRideProduct {
    upfront_fare_enabled: boolean,
    capacity: number,
    product_id: string,
    price_details: {
        service_fees: [
            {
                fee: number,
                name: string
            }
        ],
        cost_per_minute: number,
        distance_unit: string,
        minimum: number,
        cost_per_distance: number,
        base: number,
        cancellation_fee: number,
        currency_code: string
    },
    image: string,
    cash_enabled: boolean,
    shared: boolean,
    short_description: string,
    display_name: string,
    product_group: string,
    description: string,
    is_valid: boolean
}