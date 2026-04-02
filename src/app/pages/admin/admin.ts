import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class AdminComponent implements OnInit {
  stats: any = null;
  isLoadingStats = true;

  // Recherche
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  hasSearched = false;

  // Vue utilisateur
  selectedUserId: number | null = null;
  selectedUserAnnonces: any[] = [];
  isLoadingAnnonces = false;

  userToToggleBan: any = null;
  annonceToDeleteId: number | null = null;

  banMotifText = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.authService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  viewBannedUsers() {
    this.isSearching = true;
    this.hasSearched = true;
    this.authService.adminGetBannedUsers().subscribe({
      next: (users) => {
        this.searchResults = users;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isSearching = false),
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) return;

    this.isSearching = true;
    this.hasSearched = true;
    this.authService.adminSearchUsers(this.searchQuery).subscribe({
      next: (users) => {
        this.searchResults = users;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isSearching = false;
      },
    });
  }

  initToggleBan(user: any) {
    this.userToToggleBan = user;
  }

  cancelToggleBan() {
    this.userToToggleBan = null;
  }

  confirmToggleBan() {
    if (!this.userToToggleBan) return;
    const user = this.userToToggleBan;

    this.authService.adminBanUser(user.id, this.banMotifText).subscribe({
      next: (res: any) => {
        user.isBanned = res.isBanned;
        user.banMotif = res.banMotif; // Met à jour l'affichage
        this.userToToggleBan = null;
        this.banMotifText = ''; // On vide le champ
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  initDeleteAnnonce(id: number) {
    this.annonceToDeleteId = id;
  }

  cancelDeleteAnnonce() {
    this.annonceToDeleteId = null;
  }

  confirmDeleteAnnonce() {
    if (!this.annonceToDeleteId) return;
    const id = this.annonceToDeleteId;

    this.authService.adminDeleteAnnonce(id).subscribe({
      next: () => {
        // Retire l'annonce de la liste locale
        this.selectedUserAnnonces = this.selectedUserAnnonces.filter((a) => a.id !== id);
        this.loadStats(); // MAJ des compteurs
        this.annonceToDeleteId = null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur de suppression', err),
    });
  }

  viewAnnonces(userId: number) {
    // Si on clique sur le même, on ferme l'accordéon
    if (this.selectedUserId === userId) {
      this.selectedUserId = null;
      return;
    }

    this.selectedUserId = userId;
    this.isLoadingAnnonces = true;
    this.authService.adminGetUserAnnonces(userId).subscribe({
      next: (annonces) => {
        this.selectedUserAnnonces = annonces;
        this.isLoadingAnnonces = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }
}
