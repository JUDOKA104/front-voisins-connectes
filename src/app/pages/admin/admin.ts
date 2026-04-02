import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { AdminStats, AdminUser, Annonce } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, DatePipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<AdminStats | null>(null);
  isLoadingStats = signal(true);

  searchQuery = signal('');
  searchResults = signal<AdminUser[]>([]);
  isSearching = signal(false);
  hasSearched = signal(false);

  selectedUserId = signal<number | null>(null);
  selectedUserAnnonces = signal<Annonce[]>([]);
  isLoadingAnnonces = signal(false);

  userToToggleBan = signal<AdminUser | null>(null);
  annonceToDeleteId = signal<number | null>(null);
  banMotifText = signal('');

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoadingStats.set(false);
      },
    });
  }

  viewBannedUsers(): void {
    this.isSearching.set(true);
    this.hasSearched.set(true);
    this.adminService.getBannedUsers().subscribe({
      next: (users) => {
        this.searchResults.set(users);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false),
    });
  }

  searchUsers(): void {
    if (!this.searchQuery().trim()) return;

    this.isSearching.set(true);
    this.hasSearched.set(true);
    this.adminService.searchUsers(this.searchQuery()).subscribe({
      next: (users) => {
        this.searchResults.set(users);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false),
    });
  }

  initToggleBan(user: AdminUser): void {
    this.userToToggleBan.set(user);
  }

  cancelToggleBan(): void {
    this.userToToggleBan.set(null);
  }

  confirmToggleBan(): void {
    const user = this.userToToggleBan();
    if (!user) return;

    this.adminService.banUser(user.id, this.banMotifText()).subscribe({
      next: (res) => {
        this.searchResults.update((users) =>
          users.map((u) =>
            u.id === user.id ? { ...u, isBanned: res.isBanned, banMotif: res.banMotif ?? undefined } : u,
          ),
        );
        this.userToToggleBan.set(null);
        this.banMotifText.set('');
      },
    });
  }

  initDeleteAnnonce(id: number): void {
    this.annonceToDeleteId.set(id);
  }

  cancelDeleteAnnonce(): void {
    this.annonceToDeleteId.set(null);
  }

  confirmDeleteAnnonce(): void {
    const id = this.annonceToDeleteId();
    if (!id) return;

    this.adminService.deleteAnnonce(id).subscribe({
      next: () => {
        this.selectedUserAnnonces.update((list) => list.filter((a) => a.id !== id));
        this.loadStats();
        this.annonceToDeleteId.set(null);
      },
    });
  }

  viewAnnonces(userId: number): void {
    if (this.selectedUserId() === userId) {
      this.selectedUserId.set(null);
      return;
    }

    this.selectedUserId.set(userId);
    this.isLoadingAnnonces.set(true);
    this.adminService.getUserAnnonces(userId).subscribe({
      next: (annonces) => {
        this.selectedUserAnnonces.set(annonces);
        this.isLoadingAnnonces.set(false);
      },
    });
  }
}
