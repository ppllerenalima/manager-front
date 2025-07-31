import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentFirmasComponent } from './recent-firmas.component';

describe('RecentFirmasComponent', () => {
  let component: RecentFirmasComponent;
  let fixture: ComponentFixture<RecentFirmasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentFirmasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentFirmasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
