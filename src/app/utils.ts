import { Subscription } from "rxjs";

export function unsubscribe(subscription: Subscription) {
    if (subscription) {
        subscription.unsubscribe();
        subscription = undefined;
    }
}

export function roundRobin(array: any[], index: number) {
    if (index >= array.length - 1) return array[0];
    return array[++index];
}