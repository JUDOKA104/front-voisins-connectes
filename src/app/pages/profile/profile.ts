import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  email = '';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  photoUrl: string | null = null;
  selectedFile: File | null = null;
  badges: any[] = [];

  notificationMessage = '';
  isErrorNotification = false;
  private toastTimer: any;

  hasUnsavedChanges = false;
  showUnsavedModal = false;
  private unsavedSubject = new Subject<boolean>();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.email = user.email;
        this.photoUrl = user.photoProfil;
        this.badges = user.badges || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.markAsDirty();

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  markAsDirty() {
    this.hasUnsavedChanges = true;
  }

  confirmLeave() {
    this.showUnsavedModal = false;
    this.unsavedSubject.next(true); // Autorise la navigation
  }

  cancelLeave() {
    this.showUnsavedModal = false;
    this.unsavedSubject.next(false); // Annule la navigation, on reste sur la page
  }

  showNotification(message: string, isError: boolean = false) {
    this.notificationMessage = message;
    this.isErrorNotification = isError;
    this.cdr.detectChanges();

    clearTimeout(this.toastTimer);

    // On cache le message après 4 secondes
    this.toastTimer = setTimeout(() => {
      this.notificationMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  saveProfile() {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.showNotification('Les mots de passe ne correspondent pas !', true);
      return;
    }

    const formData = new FormData();
    if (this.email) formData.append('email', this.email);
    if (this.oldPassword) formData.append('oldPassword', this.oldPassword);
    if (this.newPassword) formData.append('newPassword', this.newPassword);
    if (this.selectedFile) formData.append('photoProfil', this.selectedFile);

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.showNotification('Vos modifications ont été enregistrées avec succès.', false);
        this.hasUnsavedChanges = false;

        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.selectedFile = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification(err.error?.erreur || 'Erreur lors de la mise à jour.', true);
      },
    });
  }
}
