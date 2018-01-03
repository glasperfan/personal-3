import { Component, OnInit } from '@angular/core';
import { Locals } from '../../services/Localization';

@Component({
  selector: 'p3-footer',
  templateUrl: 'footer.component.html',
  styleUrls: [ 'footer.component.less' ]
})
export class FooterComponent implements OnInit {
  public copyright: string;

  constructor() {
    this.copyright = Locals.About.Copyright(Locals.About.Name, Locals.About.Year);
  }

  ngOnInit() { }
}
