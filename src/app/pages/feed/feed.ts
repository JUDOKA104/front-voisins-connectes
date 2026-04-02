import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnnonceService } from '../../core/services/annonce.service';
import { Annonce, Categorie, User } from '../../core/models';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './feed.html',
  styleUrls: ['./feed.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedComponent implements OnInit {
  private authService = inject(AuthService);
  private annonceService = inject(AnnonceService);
  private router = inject(Router);

  categories = signal<Categorie[]>([]);
  selectedCat = signal<number | null>(null);
  allAnnonces = signal<Annonce[]>([]);
  currentUser = signal<User | null>(null);
  showAccessibleOnly = signal(false);
  showCertifiedOnly = signal(false);

  displayedAnnonces = computed(() => {
    let filtered = this.allAnnonces();
    const user = this.currentUser();

    if (user) {
      filtered = filtered.filter((a) => {
        const isMine = a.createur?.id === user.id;
        const amIHelping = a.helpers?.some((h) => h.id === user.id);
        return !isMine && !amIHelping;
      });
    }

    if (this.showAccessibleOnly()) {
      filtered = filtered.filter((a) => {
        if (!a.maxHelpers) return true;
        return (a.helpers?.length || 0) < a.maxHelpers;
      });
    }

    if (this.showCertifiedOnly()) {
      filtered = filtered.filter((a) => {
        return a.createur?.badges && a.createur.badges.length > 0;
      });
    }

    return filtered;
  });

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.annonceService.getCategories().subscribe((c) => this.categories.set(c));
        this.loadAnnonces(null);
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
    });
  }

  loadAnnonces(catId: number | null): void {
    this.selectedCat.set(catId);
    this.annonceService.getAnnonces(catId ?? undefined).subscribe({
      next: (data) => this.allAnnonces.set(data),
    });
  }

  toggleCertifiedFilter(): void {
    this.showCertifiedOnly.update((v) => !v);
  }

  setAccessibleFilter(accessibleOnly: boolean): void {
    this.showAccessibleOnly.set(accessibleOnly);
  }
}