import { Subscription } from "rxjs";

export function unsubscribe(subscription: Subscription) {
    if (subscription) {
        subscription.unsubscribe();
        subscription = undefined;
    }
}