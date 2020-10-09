import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesComponentComponent } from './files-component.component';

describe('FilesComponentComponent', () => {
  let component: FilesComponentComponent;
  let fixture: ComponentFixture<FilesComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
