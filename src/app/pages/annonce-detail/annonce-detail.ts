import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/mock.service';

@Component({
  selector: 'app-annonce-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './annonce-detail.html',
  styleUrls: ['./annonce-detail.scss'],
})
export class AnnonceDetailComponent implements OnInit {
  annonce: any;
  commentaires: any[] = []; // On va la remplir correctement !
  newCommentText = '';
  currentUser: any;
  isHelper = false;
  showWithdrawModal = false;
  withdrawMotif = '';
  isLoading = false;
  origin = 'feed';
  showAdminDeleteModal = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.origin = history.state.origin || 'feed';
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
        this.loadAnnonce();
      },
    });
  }

  loadAnnonce() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.authService.getAnnonceById(id).subscribe({
        next: (data) => {
          this.annonce = data;

          this.commentaires = (data.commentaires || []).sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          if (this.currentUser) {
            this.isHelper = data.helpers?.some((h: any) => h.id === this.currentUser.id) || false;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
    }
  }

  formatRelativeDate(dateInput: any): string {
    const date = new Date(dateInput);
    const now = new Date();

    // On compare les dates sans l'heure pour Aujourd'hui/Hier
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }
    return date.toLocaleDateString('fr-FR');
  }

  get isAuthor(): boolean {
    return this.annonce?.createur?.id === this.currentUser?.id;
  }

  get isAdmin(): boolean {
    return this.currentUser?.roles?.includes('ROLE_ADMIN') || false;
  }

  openAdminDeleteModal() {
    this.showAdminDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeAdminDeleteModal() {
    this.showAdminDeleteModal = false;
    this.cdr.detectChanges();
  }

  confirmAdminDelete() {
    this.authService.adminDeleteAnnonce(this.annonce.id).subscribe({
      next: () => {
        this.closeAdminDeleteModal();
        // On retourne au Fil (ou au Kanban) de manière fluide
        history.back();
      },
      error: (err) => console.error('Erreur de suppression', err),
    });
  }

  get canViewComments(): boolean {
    return this.isAuthor || this.isHelper || this.isAdmin;
  }

  get isFull(): boolean {
    if (!this.annonce || !this.annonce.maxHelpers) {
      return false; // Pas de limite
    }
    return (this.annonce.helpers?.length || 0) >= this.annonce.maxHelpers;
  }

  proposerAide() {
    this.authService.aiderAnnonce(this.annonce.id).subscribe({
      next: (res) => {
        this.isHelper = true;
        // Recharger l'annonce pour voir le message système "XXX a rejoint l'équipe"
        this.loadAnnonce();
      },
      error: (err) => {
        console.error('Erreur API :', err);
        alert(err.error?.erreur || 'Impossible de rejoindre cette annonce.');
      },
    });
  }

  seDesister() {
    const motif =
      prompt('Pour quelle raison devez-vous annuler votre aide ? (Optionnel)') ||
      'Pas de motif précisé';

    this.authService.desisterAnnonce(this.annonce.id, motif).subscribe({
      next: () => {
        this.isHelper = false;
        this.loadAnnonce(); // Recharge l'annonce pour voir le message du bot
      },
      error: (err) => {
        console.error('Erreur API :', err);
        alert('Impossible de se désister.');
      },
    });
  }

  openWithdrawModal() {
    this.withdrawMotif = '';
    this.showWithdrawModal = true;
    this.cdr.detectChanges();
  }

  closeWithdrawModal() {
    this.showWithdrawModal = false;
    this.cdr.detectChanges();
  }

  confirmWithdrawal() {
    if (!this.annonce?.id) return;

    this.isLoading = true;
    const motifFinal = this.withdrawMotif.trim() || 'Désistement sans motif précisé.';

    this.authService.desisterAnnonce(this.annonce.id, motifFinal).subscribe({
      next: () => {
        this.isLoading = false;
        this.isHelper = false;
        this.closeWithdrawModal();
        this.loadAnnonce();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur API désistement :', err);
        alert(err.error?.erreur || 'Impossible de se désister.');
      },
    });
  }

  addComment() {
    if (!this.newCommentText.trim()) return;

    this.authService.addComment(this.annonce.id, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = ''; // On vide le champ
        this.loadAnnonce(); // On recharge pour afficher le nouveau commentaire
      },
      error: (err) => {
        console.error("Erreur d'envoi du commentaire :", err);
        alert("Impossible d'envoyer le commentaire.");
      },
    });
  }
}
