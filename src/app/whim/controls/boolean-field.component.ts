import { FieldComponent } from './field.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'p3-whim-boolean-field',
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.less']
})
export class BooleanFieldComponent extends FieldComponent<boolean> implements OnInit {

  ngOnInit() {
    this.label = this.label || 'Untitled';
  }

  // Override since boolean
  get shouldShow(): boolean {
    return true;
  }
}
