import { Component, OnInit } from '@angular/core';
import { Locals } from '../../services/Localization';

@Component({
  selector: 'p3-footer',
  templateUrl: 'footer.component.html',
  styleUrls: [ 'footer.component.less' ]
})
export class FooterComponent implements OnInit {
  public copyright: string;
  public currentYear: number = new Date().getFullYear();

  constructor() {
    this.copyright = Locals.About.Copyright(Locals.About.Name, this.currentYear);
  }

  ngOnInit() { }
}
