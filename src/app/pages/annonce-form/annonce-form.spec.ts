import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonceForm } from './annonce-form';

describe('AnnonceForm', () => {
  let component: AnnonceForm;
  let fixture: ComponentFixture<AnnonceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonceForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnonceForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
