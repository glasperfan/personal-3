import { Component, OnInit } from '@angular/core';
import { FieldComponent } from './field.component';

@Component({
  selector: 'p3-whim-multiline-field',
  templateUrl: './multiline-field.component.html',
  styleUrls: ['./multiline-field.component.less']
})
export class MultilineFieldComponent extends FieldComponent<string> implements OnInit {
  private readonly emptyProperty = '';

  ngOnInit() {
    this.label = this.label || 'Untitled';
  }
}
