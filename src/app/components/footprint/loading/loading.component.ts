import { Component, Input } from "@angular/core";

@Component({
    selector: 'p3-loading',
    template: `
        <div class="wrapper" [style.height.px]="height">
            <mat-spinner></mat-spinner>
        </div>`,
    styleUrls: ['loading.component.less']
})
export class LoadingComponent {
    @Input() height: number;
}