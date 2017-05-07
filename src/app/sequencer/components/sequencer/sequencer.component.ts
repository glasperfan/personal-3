import { Component } from '@angular/core';
import { PianoMidi } from 'app/sequencer/sounds/Piano';
import { IMidi } from 'app/sequencer/models/IMidi';

@Component({
  selector: 'p3-sequencer',
  template: `<p3-sidebar></p3-sidebar>
            <p3-cmd-line><p3-cmd-line>`,
  styleUrls: ['./sequencer.component.less']
})
export class SequencerComponent {

  constructor() {

  }

}

export let MIDI: IMidi = {
  piano: PianoMidi
};

