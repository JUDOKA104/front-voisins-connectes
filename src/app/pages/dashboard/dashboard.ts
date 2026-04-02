import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SlicePipe, DatePipe } from '@angular/common';
import { Annonce, User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { AnnonceService } from '../../core/services/annonce.service';

interface KanbanCard extends Annonce {
  category: string;
  userName: string;
  userAvatar: string | undefined;
  commentsCount: number;
  _isMine: boolean;
}

type KanbanColumn = 'En attente' | 'En cours' | 'Terminé';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, SlicePipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private annonceService = inject(AnnonceService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  myAnnonces = signal<KanbanCard[]>([]);
  helpingAnnonces = signal<KanbanCard[]>([]);
  activeTab = signal<'mine' | 'helping'>('mine');
  isLoading = signal(true);
  isScrolled = signal(false);
  isUpdating = signal(false);
  draggingCard = signal<KanbanCard | null>(null);
  dragOverColumn = signal<KanbanColumn | null>(null);
  annonceToDelete = signal<number | null>(null);

  private updateToastTimer: ReturnType<typeof setTimeout> | null = null;

  allCards = computed(() =>
    this.activeTab() === 'mine' ? this.myAnnonces() : this.helpingAnnonces(),
  );

  columnEnAttente = computed(() => this.allCards().filter((c) => c.statut === 'En attente'));
  columnEnCours = computed(() => this.allCards().filter((c) => c.statut === 'En cours'));
  columnTermine = computed(() => this.allCards().filter((c) => c.statut === 'Terminé'));

  isAdmin = computed(() => this.authService.currentUser?.roles?.includes('ROLE_ADMIN') ?? false);

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.loadDashboard();
      },
      error: () => this.logout(),
    });
  }

  ngOnDestroy(): void {
    if (this.updateToastTimer) clearTimeout(this.updateToastTimer);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    const user = this.currentUser();

    this.annonceService.getAnnonces().subscribe({
      next: (annonces) => {
        const mapped = annonces.map((a) => this.toKanbanCard(a, user));
        this.myAnnonces.set(mapped.filter((c) => c._isMine));
        this.helpingAnnonces.set(
          mapped.filter((c) => c.helpers?.some((h) => h.email === user?.email) ?? false),
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private toKanbanCard(a: Annonce, user: User | null): KanbanCard {
    return {
      ...a,
      category: a.categorie?.nom ?? 'Général',
      userName: (a.createur?.prenom ?? '') + ' ' + (a.createur?.nom ?? ''),
      userAvatar: a.createur?.photoProfil,
      commentsCount: a.commentaires?.length ?? 0,
      _isMine: a.createur?.email === user?.email,
    };
  }

  switchTab(tab: 'mine' | 'helping'): void {
    this.activeTab.set(tab);
  }

  // ── Drag & Drop ────────────────────────────
  onDragStart(event: DragEvent, card: KanbanCard): void {
    this.draggingCard.set(card);
    event.dataTransfer?.setData('text/plain', String(card.id));
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.draggingCard.set(null);
    this.dragOverColumn.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    const col = (event.currentTarget as HTMLElement).dataset['column'] as KanbanColumn;
    if (col !== this.dragOverColumn()) {
      this.dragOverColumn.set(col);
    }
  }

  onDragLeave(event: DragEvent): void {
    const rel = event.relatedTarget as HTMLElement | null;
    if (!rel || !(event.currentTarget as HTMLElement).contains(rel)) {
      this.dragOverColumn.set(null);
    }
  }

  onDrop(event: DragEvent, targetColumn: KanbanColumn): void {
    event.preventDefault();
    this.dragOverColumn.set(null);

    const card = this.draggingCard();
    if (!card || card.statut === targetColumn) {
      this.draggingCard.set(null);
      return;
    }

    const previousCol = card.statut as KanbanColumn;
    this.draggingCard.set(null);

    this.updateCardStatut(card.id, targetColumn);
    this.showUpdateToast();

    this.annonceService.updateAnnonceStatut(card.id, targetColumn).subscribe({
      next: () => this.hideUpdateToast(),
      error: () => {
        this.updateCardStatut(card.id, previousCol);
        this.hideUpdateToast();
      },
    });
  }

  private updateCardStatut(cardId: number, newStatut: string): void {
    const updateFn = (cards: KanbanCard[]) =>
      cards.map((c) => (c.id === cardId ? { ...c, statut: newStatut } : c));
    this.myAnnonces.update(updateFn);
    this.helpingAnnonces.update(updateFn);
  }

  private showUpdateToast(): void {
    if (this.updateToastTimer) clearTimeout(this.updateToastTimer);
    this.isUpdating.set(true);
  }

  private hideUpdateToast(): void {
    this.updateToastTimer = setTimeout(() => this.isUpdating.set(false), 600);
  }

  initDelete(id: number): void {
    this.annonceToDelete.set(id);
  }

  cancelDelete(): void {
    this.annonceToDelete.set(null);
  }

  confirmDelete(): void {
    const id = this.annonceToDelete();
    if (!id) return;

    this.annonceService.deleteAnnonce(id).subscribe({
      next: () => {
        this.myAnnonces.update((cards) => cards.filter((a) => a.id !== id));
        this.annonceToDelete.set(null);
      },
      error: () => this.annonceToDelete.set(null),
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}