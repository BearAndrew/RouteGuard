import { Component } from '@angular/core';
import { AuthenticationService } from './_service/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CTWDriver';

  constructor(private auth: AuthenticationService) {

  }
}
