import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-add-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.less']
})
export class AddTagsComponent {

  @Output() public tagsChange = new EventEmitter<string[]>();
  private _values: string;

  @Input() set tags(newTags: string[]) {
    this.values = (newTags && newTags.join(' ')) || '';
  }

  private get values(): string {
    return this._values;
  }

  private set values(newTags: string) {
    const tagArr = newTags && newTags.trim().length ? newTags.split(' ') : [];
    for (let i = tagArr.length - 1; i >= 0; i--) {
      if (!tagArr[i].startsWith('#')) {
        tagArr[i] = '#' + tagArr[i];
      }
    }
    this.tagsChange.emit(tagArr);
    this._values = newTags;
  }
}
