import { Component, forwardRef, inject, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconNameModel, NglxSpeakerDirective } from 'nglx-shared';
import {
  ControlContainer,
  ControlValueAccessor,
  FormGroup,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Address, TimeZone } from 'nglx-api';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, NglxSpeakerDirective, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    },
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
  templateUrl: './form-input.html',
})
export class FormInputComponent implements ControlValueAccessor {
  @Optional() private controlContainer = inject(ControlContainer);

  @Input() formControlName!: string;
  @Input() label!: string;
  @Input() labelId!: string;
  @Input() type!: string;
  @Input() inputTypeView!: string;
  @Input() iconName!: IconNameModel;
  @Input() classNames!: string;
  @Input() errorText!: string;
  @Input() isError!: boolean;
  @Input() dataForSelect!: any;
  @Input() required!: boolean;
  @Input() autoComplete!: string;

  form(fieldName: string) {
    const parent = this.parentForm;

    if (parent) {
      return parent.getRawValue()[fieldName];
    }

    return null;
  }

  compareTimezone(tz1: TimeZone, tz2: TimeZone): boolean {
    return tz1 && tz2 && tz1.name === tz2.name;
  }

  compareState(
    item1: Address.SubdivisionEnum,
    item2: Address.SubdivisionEnum
  ): boolean {
    return item1 === item2;
  }

  get parentForm(): FormGroup {
    return this.controlContainer?.control as FormGroup;
  }

  get compareWith() {
    return this.formControlName === 'timeZone'
      ? this.compareTimezone
      : this.compareState;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerOnChange(fn: any): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerOnTouched(fn: any): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  writeValue(obj: any): void {}
}
