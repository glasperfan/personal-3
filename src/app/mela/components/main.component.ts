import { Component, Inject, AfterViewInit } from '@angular/core';
import { PlaylistService } from '../services';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'p3-mela-main',
  templateUrl: 'main.component.html',
  styleUrls: ['main.component.less']
})
export class MainComponent implements AfterViewInit {
  constructor(public playlistSvc: PlaylistService, public titleSvc: Title, @Inject(DOCUMENT) private doc: HTMLDocument) {
    // Update title
    this.titleSvc.setTitle('Mela');

    // Set html background color
    const htmlElement = document.getElementsByTagName("html")[0];
    htmlElement.style["background-color"] = "#7f0000";
  }
  
  ngAfterViewInit(): void {
    // Update favicon
    this.doc.getElementById('appFavicon').setAttribute('href', `/assets/mela/favicon-mela.ico?t=${new Date().getTime()}`);
  }
}
