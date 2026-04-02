import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  prenom = '';
  nom = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  isRegistered = false;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.prenom || !this.nom || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs texte.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'La photo de profil est obligatoire.';
      return;
    }

    const formData = new FormData();
    formData.append('prenom', this.prenom);
    formData.append('nom', this.nom);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('password_confirm', this.confirmPassword);
    formData.append('photoProfil', this.selectedFile);

    this.auth.register(formData).subscribe({
      next: () => {
        this.isRegistered = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur API :', err);
        this.errorMessage = err.error?.erreur || 'Impossible de créer le compte.';
        this.cdr.detectChanges();
      },
    });
  }
}
