import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'FronEndSpoify';
  showHeaderFooter: boolean = true;


  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showHeaderFooter = !currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/verify');
      
      ;
    });
  }
}
