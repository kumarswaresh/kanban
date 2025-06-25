import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormInputComponent } from './form-input.component';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { TimeZone } from 'nglx-api';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;
  let controlContainerMock: ControlContainer;
  let mockControlContainer: Partial<ControlContainer>;
  let mockFormGroup: Partial<FormGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent, ReactiveFormsModule],
      providers: [FormGroupDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  beforeEach(() => {
    mockFormGroup = {
      getRawValue: jest.fn(),
    };

    mockControlContainer = {
      control: mockFormGroup as FormGroup,
    };

    component['controlContainer'] = mockControlContainer as ControlContainer;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return a FormGroup when controlContainer is defined', () => {
    controlContainerMock = {
      control: new FormGroup({}), // Initialize with a dummy FormGroup
    } as unknown as ControlContainer;

    component['controlContainer'] = controlContainerMock;

    const result = component.parentForm;

    expect(result).toBeInstanceOf(FormGroup);
  });

  it('should return the value of the field from parent form if it exists', () => {
    const fieldName = 'username';
    const rawValue = { username: 'john_doe' };

    (mockFormGroup.getRawValue as jest.Mock).mockReturnValue(rawValue);

    const result = component.form(fieldName);

    expect(result).toBe('john_doe');
    expect(mockFormGroup.getRawValue).toHaveBeenCalled();
  });

  it('should return undefined if field does not exist in parent form', () => {
    const fieldName = 'nonExistentField';
    const rawValue = { username: 'john_doe' };

    (mockFormGroup.getRawValue as jest.Mock).mockReturnValue(rawValue);

    const result = component.form(fieldName);

    expect(result).toBeUndefined();
  });

  it('should return null if getRawValue is undefined or null', () => {
    const fieldName = 'anyField';
    jest
      .spyOn(component, 'parentForm', 'get')
      .mockReturnValue(null as unknown as FormGroup);

    const result = component.form(fieldName);

    expect(result).toBeNull();
  });

  it('should test compareTimezone', () => {
    const tz1 = {
      name: 'Test',
    } as TimeZone;
    const tz2 = {
      name: 'Test',
    } as TimeZone;

    expect(component.compareTimezone(tz1, tz2)).toBeTruthy();
  });
});
