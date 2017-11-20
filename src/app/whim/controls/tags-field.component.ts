import { Component, OnInit } from '@angular/core';
import { FieldComponent } from './field.component';

@Component({
  selector: 'p3-whim-tags-field',
  templateUrl: './tags-field.component.html',
  styleUrls: ['./tags-field.component.less']
})
export class TagsFieldComponent extends FieldComponent<string[]> implements OnInit {
  private readonly emptyProperty = '';
  private _tags: string;

  ngOnInit() {
    this.label = this.label || 'Tags';
  }

  private get tags(): string {
    if (!this._tags) {
      this._tags = this.value.join(' ');
    }
    return this._tags;
  }

  private set tags(s: string) {
    const components = (s && s.trim().split(/[\s,]+/)) || [];
    components.map(c => c.startsWith('#') ? c : '#' + c);
    this.data = components;
  }

  get shouldShow(): boolean {
    return this.showIfEmpty || this.editMode || !!this.value && !!this.value.length;
  }
}
