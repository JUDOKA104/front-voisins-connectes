import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AnnonceService } from '../../core/services/annonce.service';
import { AdminService } from '../../core/services/admin.service';
import { Annonce, Commentaire } from '../../core/models';

@Component({
  selector: 'app-annonce-detail',
  standalone: true,
  imports: [RouterModule, FormsModule, DatePipe],
  templateUrl: './annonce-detail.html',
  styleUrls: ['./annonce-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnonceDetailComponent {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private annonceService = inject(AnnonceService);
  private adminService = inject(AdminService);

  private annonceId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))));

  currentUser = toSignal(this.authService.getCurrentUser());

  annonce = signal<Annonce | null>(null);
  isLoading = signal(false);
  showWithdrawModal = signal(false);
  withdrawMotif = signal('');
  newCommentText = signal('');
  showAdminDeleteModal = signal(false);
  origin = signal('feed');

  commentaires = computed<Commentaire[]>(() => {
    const a = this.annonce();
    if (!a?.commentaires) return [];
    return [...a.commentaires].sort(
      (x, y) => new Date(y.createdAt!).getTime() - new Date(x.createdAt!).getTime(),
    );
  });

  isAuthor = computed(() => this.annonce()?.createur?.id === this.currentUser()?.id);

  isHelper = computed(() => {
    const user = this.currentUser();
    return this.annonce()?.helpers?.some((h) => h.id === user?.id) ?? false;
  });

  isAdmin = computed(() => this.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false);

  canViewComments = computed(() => this.isAuthor() || this.isHelper() || this.isAdmin());

  isFull = computed(() => {
    const a = this.annonce();
    if (!a?.maxHelpers) return false;
    return (a.helpers?.length ?? 0) >= a.maxHelpers;
  });

  constructor() {
    this.origin.set(history.state?.origin ?? 'feed');

    effect(() => {
      const id = this.annonceId();
      if (id) {
        this.fetchAnnonce(id);
      }
    });
  }

  private fetchAnnonce(id: string): void {
    this.annonceService.getAnnonceById(id).subscribe({
      next: (data) => this.annonce.set(data),
    });
  }

  private reloadAnnonce(): void {
    const id = this.annonceId();
    if (id) {
      this.fetchAnnonce(id);
    }
  }

  formatRelativeDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
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

  proposerAide(): void {
    const a = this.annonce();
    if (!a) return;
    this.annonceService.aiderAnnonce(a.id).subscribe({
      next: () => this.reloadAnnonce(),
    });
  }

  openWithdrawModal(): void {
    this.withdrawMotif.set('');
    this.showWithdrawModal.set(true);
  }

  closeWithdrawModal(): void {
    this.showWithdrawModal.set(false);
  }

  confirmWithdrawal(): void {
    const a = this.annonce();
    if (!a) return;

    this.isLoading.set(true);
    const motif = this.withdrawMotif().trim() || 'Désistement sans motif précisé.';

    this.annonceService.desisterAnnonce(a.id, motif).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeWithdrawModal();
        this.reloadAnnonce();
      },
      error: () => this.isLoading.set(false),
    });
  }

  addComment(): void {
    const text = this.newCommentText().trim();
    const a = this.annonce();
    if (!text || !a) return;

    this.annonceService.addComment(a.id, text).subscribe({
      next: () => {
        this.newCommentText.set('');
        this.reloadAnnonce();
      },
    });
  }

  openAdminDeleteModal(): void {
    this.showAdminDeleteModal.set(true);
  }

  closeAdminDeleteModal(): void {
    this.showAdminDeleteModal.set(false);
  }

  confirmAdminDelete(): void {
    const a = this.annonce();
    if (!a) return;
    this.adminService.deleteAnnonce(a.id).subscribe({
      next: () => {
        this.closeAdminDeleteModal();
        history.back();
      },
    });
  }
}
