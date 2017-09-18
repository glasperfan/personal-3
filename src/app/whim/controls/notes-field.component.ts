import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IField, INote, Note } from 'app/whim/models';

@Component({
  selector: 'p3-whim-notes-field',
  templateUrl: './notes-field.component.html',
  styleUrls: ['./notes-field.component.less']
})
export class NotesFieldComponent {

  @Input() label: string;
  @Input() field: string;
  @Input() editMode: boolean;
  @Input() showControls = false;
  @Output() onChange = new EventEmitter<IField>();
  private value: INote[];
  private newNoteText: string;
  private readonly placeholderText = 'Add a note...';

  @Input() set initialValue(initialValue: INote[]) {
    this.value = initialValue;
  }

  listenForSubmit(event: KeyboardEvent) {
    // Shift + Enter
    if (event.keyCode === 13 && event.shiftKey) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      this.addNote();
    }
  }

  deleteNote(noteIdx: number): void {
    this.value.splice(noteIdx, 1);
    this.emit();
  }

  addNote(): void {
    this.value.unshift(new Note(this.newNoteText));
    this.newNoteText = undefined;
    this.emit();
  }

  emit(): void {
    this.onChange.emit({ field: this.field, value: this.value });
  }
}
