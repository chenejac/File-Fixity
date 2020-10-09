import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsComponentComponent } from './notifications-component.component';

describe('NotificationsComponentComponent', () => {
  let component: NotificationsComponentComponent;
  let fixture: ComponentFixture<NotificationsComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
