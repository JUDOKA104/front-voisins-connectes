import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Badge } from '../../core/models';
import { CanComponentDeactivate } from '../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, CanComponentDeactivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  photoUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  badges = signal<Badge[]>([]);

  notificationMessage = signal('');
  isErrorNotification = signal(false);
  isSubmitting = signal(false);
  hasUnsavedChanges = signal(false);
  showUnsavedModal = signal(false);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private unsavedSubject = new Subject<boolean>();

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.email.set(user.email ?? '');
        this.photoUrl.set(user.photoProfil ?? null);
        this.badges.set(user.badges ?? []);
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.hasUnsavedChanges()) return true;
    this.showUnsavedModal.set(true);
    return this.unsavedSubject.asObservable();
  }

  confirmLeave(): void {
    this.showUnsavedModal.set(false);
    this.unsavedSubject.next(true);
  }

  cancelLeave(): void {
    this.showUnsavedModal.set(false);
    this.unsavedSubject.next(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.markAsDirty();

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoUrl.set((e.target as FileReader).result as string);
    };
    reader.readAsDataURL(file);
  }

  markAsDirty(): void {
    this.hasUnsavedChanges.set(true);
  }

  showNotification(message: string, isError: boolean = false): void {
    this.notificationMessage.set(message);
    this.isErrorNotification.set(isError);

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.notificationMessage.set(''), 4000);
  }

  saveProfile(): void {
    if (this.newPassword() && this.newPassword() !== this.confirmPassword()) {
      this.showNotification('Les mots de passe ne correspondent pas !', true);
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    if (this.email()) formData.append('email', this.email());
    if (this.oldPassword()) formData.append('oldPassword', this.oldPassword());
    if (this.newPassword()) formData.append('newPassword', this.newPassword());
    if (this.selectedFile()) formData.append('photoProfil', this.selectedFile()!);

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showNotification('Vos modifications ont été enregistrées avec succès.', false);
        this.hasUnsavedChanges.set(false);
        this.oldPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        this.selectedFile.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.showNotification(err.error?.erreur || 'Erreur lors de la mise à jour.', true);
      },
    });
  }
}