import { IField } from '../models';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-string-field',
  templateUrl: './string-field.component.html',
  styleUrls: ['./string-field.component.less']
})
export class StringFieldComponent implements OnInit {
  @Input() label: string;
  @Input() field: string;
  @Input() editMode: boolean;
  @Input() showControls = false;
  @Output() onChange = new EventEmitter<IField>();
  private value: string;
  private readonly emptyProperty = 'undefined';

  ngOnInit() {
  }

  @Input() set initialValue(initialValue: string) {
    this.value = initialValue;
  }

  update(newValue: string): void {
    const field = this.field;
    this.value = newValue;
    this.onChange.emit({ field: this.field, value: newValue });
  }

  edit(): void {
    this.editMode = true;
  }

  finishEdit(): void {
    this.editMode = false;
  }
}
