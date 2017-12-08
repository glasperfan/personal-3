import { Component, OnInit, Input } from '@angular/core';
import { FieldComponent } from './field.component';

@Component({
  selector: 'p3-whim-tags-field',
  templateUrl: './tags-field.component.html',
  styleUrls: ['./tags-field.component.less']
})
export class TagsFieldComponent extends FieldComponent<string[]> implements OnInit {
  private readonly emptyProperty = '';
  private _editMode: boolean;

  ngOnInit() {
    this.label = this.label || 'Tags';
  }

  @Input() set editMode(b: boolean) {
    this._editMode = b;
    // set tags
  }

  get editMode(): boolean {
    return this._editMode;
  }

  private get tags(): string {
    return this.value.join(' ');
  }

  private set tags(s: string) {
    const components = (s && s.trim().split(/[\s,]+/)) || [];
    this.data = components
      .map(c => c.startsWith('#') ? c : '#' + c)
      .filter(c => c.length > 1); // remove '#'
  }

  get shouldShow(): boolean {
    return this.showIfEmpty || this.editMode || !!this.value && !!this.value.length;
  }
}
