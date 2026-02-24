import { Component, OnDestroy } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  sub: Subscription | null = null;

  constructor(private auth: AuthService) {
    this.sub = this.auth.user$.subscribe(() => {});
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
