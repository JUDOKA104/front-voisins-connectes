import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';

import { Annonce } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Extended for Kanban metadata
interface KanbanCard extends Annonce {
  id: number;
  titre: string;
  description: string;
  statut: string;
  category: string;
  userName: string;
  userAvatar: string;
  commentsCount: number;
  _isMine?: boolean;
}

type KanbanColumn = 'En attente' | 'En cours' | 'Terminé';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ── State ──────────────────────────────────
  currentUser: any = null;
  allCards: KanbanCard[] = [];
  myAnnonces: KanbanCard[] = [];
  helpingAnnonces: KanbanCard[] = [];

  activeTab: 'mine' | 'helping' = 'mine';
  isLoading = true;
  isScrolled = false;
  isUpdating = false;

  // Drag state
  draggingCard: KanbanCard | null = null;
  dragOverColumn: KanbanColumn | null = null;
  private updateToastTimer: any;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Lifecycle ──────────────────────────────
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadDashboard();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du profil', err);
        this.logout();
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.updateToastTimer);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrolled = window.scrollY > 20;
    if (scrolled !== this.isScrolled) {
      this.isScrolled = scrolled;
      this.cdr.markForCheck();
    }
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.roles?.includes('ROLE_ADMIN') || false;
  }

  // ── Data Loading (API SYNC) ────────────────
  private loadDashboard(): void {
    this.isLoading = true;

    this.authService.getAnnonces().subscribe({
      next: (annonces: any[]) => {
        const mappedCards: KanbanCard[] = annonces.map((a) => ({
          ...a,
          category: a.categorie?.nom || 'Général',
          userName: a.createur?.prenom + ' ' + a.createur?.nom,
          userAvatar: a.createur?.photoProfil,
          commentsCount: a.commentaires?.length || 0,
          _isMine: a.createur?.email === this.currentUser?.email,
        }));

        this.myAnnonces = mappedCards.filter((a) => a._isMine);

        this.helpingAnnonces = mappedCards.filter((a) =>
          a.helpers?.some((h: any) => h.email === this.currentUser?.email),
        );

        this.rebuildCards();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Erreur de chargement', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private rebuildCards(): void {
    if (this.activeTab === 'mine') {
      this.allCards = this.myAnnonces;
    } else {
      this.allCards = this.helpingAnnonces;
    }
    this.cdr.markForCheck();
  }

  // ── Tab Switch ─────────────────────────────
  switchTab(tab: 'mine' | 'helping'): void {
    this.activeTab = tab;
    this.rebuildCards();
  }

  // ── Column Getter ──────────────────────────
  getColumn(statut: KanbanColumn): KanbanCard[] {
    return this.allCards.filter((c) => c.statut === statut);
  }

  // ── Drag & Drop ────────────────────────────
  onDragStart(event: DragEvent, card: KanbanCard): void {
    this.draggingCard = card;
    event.dataTransfer?.setData('text/plain', String(card.id));
    event.dataTransfer!.effectAllowed = 'move';
    setTimeout(() => this.cdr.markForCheck(), 0);
  }

  onDragEnd(): void {
    this.draggingCard = null;
    this.dragOverColumn = null;
    this.cdr.markForCheck();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';

    const col = (event.currentTarget as HTMLElement).dataset['column'] as KanbanColumn;
    if (col !== this.dragOverColumn) {
      this.dragOverColumn = col;
      this.cdr.markForCheck();
    }
  }

  onDragLeave(event: DragEvent): void {
    const rel = event.relatedTarget as HTMLElement | null;
    if (!rel || !(event.currentTarget as HTMLElement).contains(rel)) {
      this.dragOverColumn = null;
      this.cdr.markForCheck();
    }
  }

  onDrop(event: DragEvent, targetColumn: KanbanColumn): void {
    event.preventDefault();
    this.dragOverColumn = null;

    if (!this.draggingCard) return;
    if (this.draggingCard.statut === targetColumn) {
      this.draggingCard = null;
      this.cdr.markForCheck();
      return;
    }

    const card = this.draggingCard;
    const previousCol = card.statut as KanbanColumn;
    this.draggingCard = null;

    card.statut = targetColumn;
    this.rebuildCards();
    this.showUpdateToast();

    // mise à jour dans la base de données (API)
    this.authService.updateAnnonceStatut(card.id, targetColumn).subscribe({
      next: () => this.hideUpdateToast(),
      error: (err) => {
        // En cas d'erreur de connexion, on annule le mouvement
        console.error('Erreur API lors du drag & drop', err);
        card.statut = previousCol;
        this.rebuildCards();
      },
    });
  }

  // ── Toast ──────────────────────────────────
  private showUpdateToast(): void {
    clearTimeout(this.updateToastTimer);
    this.isUpdating = true;
    this.cdr.markForCheck();
  }

  private hideUpdateToast(): void {
    this.updateToastTimer = setTimeout(() => {
      this.isUpdating = false;
      this.cdr.markForCheck();
    }, 600);
  }

  annonceToDelete: number | null = null;

  initDelete(id: number) {
    this.annonceToDelete = id;
  }

  cancelDelete() {
    this.annonceToDelete = null;
  }

  confirmDelete() {
    if (this.annonceToDelete) {
      const id = this.annonceToDelete;

      this.authService.deleteAnnonce(id).subscribe({
        next: () => {
          this.myAnnonces = this.myAnnonces.filter((a) => a.id !== id);
          this.rebuildCards();
          this.annonceToDelete = null;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Erreur suppression', err);
          this.annonceToDelete = null;
        },
      });
    }
  }

  // ── Auth ───────────────────────────────────
  logout(): void {
    this.authService.logout(); // Adapté au cookie
    this.router.navigate(['/']);
  }

  // ── Helpers ────────────────────────────────
  trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
