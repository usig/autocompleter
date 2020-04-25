import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleterComponent } from './autocompleter.component';

describe('AutocompleterComponent', () => {
  let component: AutocompleterComponent;
  let fixture: ComponentFixture<AutocompleterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutocompleterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
