import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './annonce-form.html',
  styleUrls: ['./annonce-form.scss'],
})
export class AnnonceFormComponent {
  isEditMode = false;
  annonceId: string | null = null;
  titre = '';
  description = '';
  categorieId = '';
  estRemunere = false;
  categories: any[] = [];
  maxHelpers: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.authService.getCategories().subscribe((c) => (this.categories = c));

    this.route.paramMap.subscribe((params) => {
      this.annonceId = params.get('id');
      if (this.annonceId) {
        this.isEditMode = true;
        this.authService.getAnnonceById(this.annonceId).subscribe((a: any) => {
          this.titre = a.titre;
          this.description = a.description;
          this.categorieId = a.categorie?.id?.toString() || '';
          this.estRemunere = a.estRemunere || false;
          this.maxHelpers = a.maxHelpers;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onSubmit() {
    const payload = {
      titre: this.titre,
      description: this.description,
      categorie_id: parseInt(this.categorieId),
      estRemunere: this.estRemunere,
      maxHelpers: this.maxHelpers,
    };

    if (this.isEditMode && this.annonceId) {
      // Mode MODIFICATION
      this.authService.updateAnnonce(this.annonceId, payload).subscribe({
        next: () => {
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => console.error(err),
      });
    } else {
      // Mode CRÉATION
      this.authService.createAnnonce(payload).subscribe({
        next: () => {
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => console.error(err),
      });
    }
  }
}
