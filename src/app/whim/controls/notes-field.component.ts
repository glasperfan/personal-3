import { FieldComponent } from './field.component';
import { Component, OnInit } from '@angular/core';
import { IField, INote, Note } from 'app/whim/models';

@Component({
  selector: 'p3-whim-notes-field',
  templateUrl: './notes-field.component.html',
  styleUrls: ['./notes-field.component.less']
})
export class NotesFieldComponent extends FieldComponent<INote[]> implements OnInit {
  private newNoteText: string;

  ngOnInit() {
    this.label = this.label || 'Notes';
  }

  listenForSubmit(event: KeyboardEvent) {
    // Shift + Enter
    if (event.keyCode === 13 && event.shiftKey) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      if (this.hasContent) {
        this.addNote();
      }
    }
  }

  deleteNote(noteIdx: number): void {
    this.value.splice(noteIdx, 1);
    this.data = this.value; // emit
  }

  addNote(): void {
    if (this.data) {
      this.data = [new Note(this.newNoteText)].concat(this.value); // append to front and emit
    } else {
      this.data = [new Note(this.newNoteText)];
    }
    this.newNoteText = undefined;
  }

  updateNote(note: INote, noteIdx: number, newText: string) {
    this.value[noteIdx].text = newText;
    this.value[noteIdx].dateModified = Date.now();
    this.dataChange.emit(this.value);
  }

  private get hasContent(): boolean {
    return !!this.newNoteText.trim().length;
  }

  get shouldShow(): boolean {
    return this.showIfEmpty || this.editMode || !!this.value && !!this.value.length;
  }
}
