import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'p3-whim-add-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.less']
})
export class AddTagsComponent {

  @Output() public tagsChange = new EventEmitter<string[]>();
  private _tagArr: string[];
  private _tagStr: string;

  // tags allows others to bind to the output array
  @Input() public get tags(): string[] {
    return this._tagArr;
  }

  public set tags(newTags: string[]) {
    this._tagArr = newTags;
  }

  // _tags parses the input string (_tagStr) into an array of tags (_tagArr)
  private get _tags(): string {
    return this._tagStr;
  }

  private set _tags(s: string) {
    const components = (s && s.trim().split(/[\s,]+/)) || [];
    components.map(c => c.startsWith('#') ? c : '#' + c);
    this.tags = components;
    this.tagsChange.emit(this.tags);
  }
}
