import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: '' },
  );

  showGlobalNav = computed(() => {
    const url = this.currentUrl();
    return url.includes('/app/') && !url.includes('/app/dashboard');
  });

  showFeedLink = computed(() => !this.currentUrl().includes('/app/feed'));

  isAdmin = computed(() => this.authService.currentUser?.roles?.includes('ROLE_ADMIN') ?? false);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.authService.currentUser && !this.currentUser()) {
          this.authService.getCurrentUser().subscribe({
            next: (user) => this.currentUser.set(user),
          });
        } else if (!this.authService.currentUser) {
          this.currentUser.set(null);
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}