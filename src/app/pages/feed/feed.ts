import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/mock.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './feed.html',
  styleUrls: ['./feed.scss'],
})
export class FeedComponent implements OnInit {
  categories: any[] = [];
  selectedCat: number | null = null;

  allAnnonces: any[] = [];
  displayedAnnonces: any[] = [];
  showAccessibleOnly = false;
  showCertifiedOnly = false;

  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;

        this.authService.getCategories().subscribe((c) => {
          this.categories = c;
          this.cdr.detectChanges();
        });

        this.loadAnnonces();
      },
      error: (err) => {
        console.error('Erreur récupération utilisateur', err);
        this.authService.logout();
        this.router.navigate(['/']);
      },
    });
  }

  loadAnnonces(catId: number | null = null) {
    this.selectedCat = catId;
    this.authService.getAnnonces(catId || undefined).subscribe({
      next: (data) => {
        this.allAnnonces = data;
        this.applyFilters();
      },
      error: (err) => console.error(err),
    });
  }

  toggleAccessibleFilter() {
    this.showAccessibleOnly = !this.showAccessibleOnly;
    this.applyFilters();
  }

  toggleCertifiedFilter() {
    this.showCertifiedOnly = !this.showCertifiedOnly;
    this.applyFilters();
  }

  resetFilters() {
    this.showAccessibleOnly = false;
    this.showCertifiedOnly = false;
    this.applyFilters();
  }

  setAccessibleFilter(accessibleOnly: boolean) {
    this.showAccessibleOnly = accessibleOnly;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.allAnnonces;

    if (this.currentUser) {
      filtered = filtered.filter((a) => {
        const isMine = a.createur?.id === this.currentUser.id;
        const amIHelping = a.helpers?.some((h: any) => h.id === this.currentUser.id);
        return !isMine && !amIHelping;
      });
    }

    if (this.showAccessibleOnly) {
      filtered = filtered.filter((a) => {
        if (!a.maxHelpers) return true;
        return (a.helpers?.length || 0) < a.maxHelpers;
      });
    }

    if (this.showCertifiedOnly) {
      filtered = filtered.filter((a) => {
        return a.createur?.badges && a.createur.badges.length > 0;
      });
    }

    this.displayedAnnonces = filtered;
    this.cdr.detectChanges();
  }
}
