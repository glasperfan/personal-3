import { WhimError } from '../models';
import { FieldComponent } from './field.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'p3-whim-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.less']
})
export class SelectFieldComponent extends FieldComponent<any> implements OnInit {
  @Input() options: any[]; // should match type of (value: T)
  @Input() optionNames: string[]; // should match order of options
  @Input() defaultIdx: number;

  ngOnInit() {
    if (!this.value && this.defaultIdx !== undefined) {
      if (this.defaultIdx > this.options.length) {
        throw new WhimError('Default select index does not match an option.');
      }
      this.value = this.options[this.defaultIdx];
    }
  }

  private get _valueName(): string {
    const choiceIdx = this.options.findIndex(opt => this.isSameObject(opt, this.value));
    return this.optionNames[choiceIdx < 0 ? this.defaultIdx : choiceIdx];
  }

  private isSameObject(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
