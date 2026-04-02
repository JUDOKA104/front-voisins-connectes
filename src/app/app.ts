import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/mock.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  currentUser: any = null;
  currentUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;

        if (this.authService.currentUser && !this.currentUser) {
          this.authService.getCurrentUser().subscribe({
            next: (user) => {
              this.currentUser = user;
              this.cdr.detectChanges();
            },
          });
        } else if (!this.authService.currentUser) {
          this.currentUser = null;
        }
      });
  }

  ngOnInit() {}

  get isAdmin(): boolean {
    return this.authService.currentUser?.roles?.includes('ROLE_ADMIN') || false;
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/']);
  }

  get showGlobalNav(): boolean {
    return this.currentUrl.includes('/app/') && !this.currentUrl.includes('/app/dashboard');
  }
}
