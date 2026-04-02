// ════════════════════════════════════════════════
// HOME COMPONENT — home.component.ts
// ════════════════════════════════════════════════

import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { Annonce, Categorie, User, Commentaire } from '../../core/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  // ── State ──────────────────────────────────
  annonces: Annonce[] = [];
  filteredAnnonces: Annonce[] = [];
  categories: Categorie[] = [];
  selectedCategorie: Categorie | null = null;
  isLoading = true;
  isScrolled = false;

  // ── Static content ─────────────────────────
  marqueeWords = [
    'Bricolage',
    'Jardinage',
    'Soutien scolaire',
    'Informatique',
    'Déménagement',
    "Garde d'animaux",
    'Courses',
    'Cuisine',
    'Tutorat',
    'Aide à domicile',
    'Couture',
    'Photographie',
  ];

  stats = [
    { value: '1 200+', label: 'Membres actifs' },
    { value: '340', label: 'Annonces ce mois' },
    { value: '18', label: 'Quartiers couverts' },
  ];

  values = [
    {
      number: '01',
      title: 'Proximité réelle',
      desc: "Échangez avec des habitants de votre quartier. Pas d'inconnus à l'autre bout de la ville.",
    },
    {
      number: '02',
      title: 'Liberté de choix',
      desc: "Services gratuits ou rémunérés. Vous décidez. La plateforme facilite, n'impose pas.",
    },
    {
      number: '03',
      title: 'Confiance par défaut',
      desc: 'Profils vérifiés, évaluations transparentes. La communauté se régule elle-même.',
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Scroll Detection ───────────────────────
  @HostListener('window:scroll')
  onScroll(): void {
    const scrolled = window.scrollY > 20;
    if (scrolled !== this.isScrolled) {
      this.isScrolled = scrolled;
      this.cdr.markForCheck();
    }
  }

  // ── Filter ─────────────────────────────────
  filterByCategorie(categorie: Categorie | null): void {
    this.selectedCategorie = categorie;
    if (!categorie) {
      this.filteredAnnonces = this.annonces;
    } else {
      this.filteredAnnonces = this.annonces.filter((a) => a.categorie?.id === categorie.id);
    }
    this.cdr.markForCheck();
  }

  // ── Track function ─────────────────────────
  trackById(_: number, item: { id: number }): number {
    return item.id;
  }
}
