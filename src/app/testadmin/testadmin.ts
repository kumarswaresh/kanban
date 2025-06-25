import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FC,
  IconComponent,
  NglxSpeakerDirective,
  NglxVerboseInfoDirective,
  NotificationService,
  PersonProfile,
  PersonProfileService,
  SnackbarComponent,
  SnackbarModel,
  StatesModel,
} from 'nglx-shared';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AddressAndPhone } from '../../../shared/models/forms.model';
import { FormControlsComponent } from '../../../shared/components/forms-controls/form-controls.component';
import {
  AddressV2Inner,
  AllChannelSetting,
  PersonDetailV2,
  SmsOptInUpdate,
} from 'nglx-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import SubdivisionEnum = AddressV2Inner.SubdivisionEnum;
import { debounceTime, finalize, Observable, timer } from 'rxjs';
import { SnackbarMessage } from '../../../shared/models/snackbar.model';
import { debounceValidator } from '../../../utils/debounce-validation.util';
import { FormInputComponent } from './form-input';
import { applyPhoneMask, applyZipCodeMask } from '../../../utils/mask.util';

@Component({
  selector: 'app-address-phone-form',
  standalone: true,
  imports: [
    CommonModule,
    NglxSpeakerDirective,
    FormControlsComponent,
    SnackbarComponent,
    ReactiveFormsModule,
    IconComponent,
    FormInputComponent,
    NglxVerboseInfoDirective,
  ],
  templateUrl: './testadmin.html',
})
export class AddressPhoneFormComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly personService = inject(PersonProfileService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly StatesModel = StatesModel;

  addressPhoneForm!: FormGroup<FC<AddressAndPhone>>;
  personDetails!: AddressAndPhone;
  identityPersonProfile!: PersonDetailV2;

  snackbar: SnackbarMessage = {
    msg: '',
    status: undefined,
  };
  textMessagingFormPrevValue = {};
  notificationFormPrevValue = {};
  currentStateValue = '';
  aria_announcement_message = '';

  ngOnInit() {
    this.formInitialization();
    this.initializationFormData();
    this.formValueChangeInitialization();
    this.preventChangeState();
    this.applyMaskOnChange();
    this.setFormValidations();
  }

  formInitialization(): void {
    this.addressPhoneForm = new FormGroup<FC<AddressAndPhone>>({
      streetAddress: new FormControl('', [Validators.required]),
      streetAddressLine2: new FormControl(''),
      state: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required]),
      primary: new FormControl('', [Validators.required]),
      mobile: new FormControl(''),
    });

    this.addressPhoneForm.disable({ emitEvent: false });
  }

  initializationFormData(): void {
    this.personService.identityPersonProfile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: PersonDetailV2 | undefined) => {
        if (res) {
          this.identityPersonProfile = res;

          const personProfile = new PersonProfile(res);
          const mainAddress = personProfile.mainAddress;
          const personProfileData = {
            state: mainAddress?.subdivision || '',
            primary: applyPhoneMask(personProfile.homeNumber?.number as string),
            mobile: applyPhoneMask(
              personProfile.mobileNumber?.number as string
            ),
            zipCode: mainAddress?.postalCode,
            city: mainAddress?.city,
            streetAddress: personProfile.mainAddressLines?.[0]?.entry,
            streetAddressLine2: personProfile.mainAddressLines?.[1]?.entry,
          } as AddressAndPhone;

          this.personDetails = personProfileData;
          this.textMessagingFormPrevValue =
            this.textMessagingForm?.getRawValue();
          this.notificationFormPrevValue = this.notificationForm?.getRawValue();

          this.addressPhoneForm?.patchValue(personProfileData, {
            emitEvent: false,
          });
        }
      });
  }

  formValueChangeInitialization(): void {
    this.addressPhoneForm
      .get('mobile')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.personService.updateAddressPhoneForm(this.addressPhoneForm);
      });
  }

  handleAddressFormSubmit(): void {
    if (this.addressPhoneForm?.valid) {
      this.addressPhoneForm.markAllAsTouched({ emitEvent: false });
      const personDetails = new PersonProfile(this.identityPersonProfile);

      personDetails.mainAddress = {
        city: this.addressPhoneForm.get('city')?.value as string,
        postalCode: this.addressPhoneForm.get('zipCode')?.value as string,
        subdivision: this.addressPhoneForm.get('state')
          ?.value as SubdivisionEnum,
      };

      const mainAddressLines = personDetails.mainAddressLines;

      const addressLine1 = this.addressPhoneForm.get('streetAddress')
        ?.value as string;
      const addressLine2 = this.addressPhoneForm.get('streetAddressLine2')
        ?.value as string;

      mainAddressLines[0].entry = addressLine1;
      mainAddressLines[1].entry = addressLine2;

      personDetails.mainAddressLines = mainAddressLines;

      personDetails.homeNumber = {
        number: this.addressPhoneForm.get('primary')?.value?.replace(/-/g, ''),
      };

      personDetails.mobileNumber = {
        number: this.addressPhoneForm.get('mobile')?.value?.replace(/-/g, ''),
      };

      this.onPersonFormSubmit({
        addresses: personDetails.getRawValue().addresses,
        phones: personDetails.getRawValue().phones,
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const successMessage =
              'Address and Phones Numbers updated successfully.';

            this.setSnackBarInfo(successMessage, SnackbarModel.Success);
            this.personDetails = this.addressPhoneForm.getRawValue();

            this.addressPhoneForm?.markAsPristine({ emitEvent: false });
            this.updateAriaAnnouncementMessage(successMessage);
          },
          error: (err) => {
            const description = err.error?.description.split(': ')[1];
            const message = err.message.split('https')[0];
            const msg = description || message;
            const errorMessage = `Oops! Something went wrong. ${msg}`;

            this.setSnackBarInfo(errorMessage, SnackbarModel.Error);

            this.addressPhoneForm?.markAsPristine({ emitEvent: false });

            this.updateAriaAnnouncementMessage(errorMessage);
          },
          complete: () => {
            this.uncheckTextMessagingSMSNotificationForms();
          },
        });
    }
  }

  onPersonFormSubmit(
    data: Partial<PersonDetailV2>
  ): Observable<PersonDetailV2> {
    return this.personService.patchPersonProfile(data).pipe(
      finalize(() => {
        this.addressPhoneForm?.disable({ emitEvent: false });
      })
    );
  }

  updateAriaAnnouncementMessage(message: string): void {
    timer(500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.aria_announcement_message = message;

        timer(5000)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.aria_announcement_message = '';
          });
      });
  }

  uncheckTextMessagingSMSNotificationForms(): void {
    const textMessagingStatus = this.textMessagingForm?.get('checkBox')?.value;
    const notificationMessagingStatus =
      this.notificationForm?.get('smsCheckBox')?.value;
    const mobilePhoneNumber = this.addressPhoneForm?.get('mobile')?.value;

    if (!mobilePhoneNumber && textMessagingStatus) {
      this.textMessagingForm.patchValue(
        { checkBox: false },
        { emitEvent: false }
      );
      this.onMessagingSubmit();
    }

    if (!mobilePhoneNumber && notificationMessagingStatus) {
      this.notificationForm.patchValue(
        {
          smsCheckBox: false,
          pushCheckBox: false,
        },
        { emitEvent: false }
      );
      this.onNotificationsSubmit();
    }
  }

  handleSnackbarClose(): void {
    this.snackbar.status = undefined;
  }

  getAddressPhoneFormError(controlName: string, errorType: string): boolean {
    return (
      this.addressPhoneForm.get(controlName)?.errors?.[errorType] &&
      this.addressPhoneForm.get(controlName)?.dirty
    );
  }

  setSnackBarInfo(msg: string, status: SnackbarModel): void {
    this.snackbar = { msg, status };
  }

  onMessagingSubmit(): void {
    const sms: SmsOptInUpdate = {
      smsOptedIn: this.textMessagingForm?.get('checkBox')?.value,
      phoneNumber: this.personDetails?.mobile as string,
      messagesPerMonth: undefined,
    };
    this.notificationService
      .postSMSOptIn(sms)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.textMessagingFormPrevValue =
            this.textMessagingForm?.getRawValue();
        },
        error: () => {
          this.textMessagingForm.patchValue(this.textMessagingFormPrevValue, {
            emitEvent: false,
          });
        },
      });
  }

  onNotificationsSubmit(): void {
    const formData = this.notificationForm.getRawValue();
    const data: AllChannelSetting = {
      appRegistered: formData['pushCheckBox'],
      smsRegistered: formData['smsCheckBox'],
    };

    this.notificationService
      .putNotificationSettings(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationFormPrevValue = this.notificationForm?.getRawValue();
        },
        error: () => {
          this.notificationForm.patchValue(this.notificationFormPrevValue, {
            emitEvent: false,
          });
        },
      });
  }

  preventChangeState(): void {
    this.currentStateValue = this.addressPhoneForm.get('state')
      ?.value as string;

    this.addressPhoneForm
      .get('state')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          this.currentStateValue = value as string;
        }
      });

    this.addressPhoneForm
      .get('primary')
      ?.valueChanges.pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.statePatchValue();
      });

    this.addressPhoneForm
      .get('mobile')
      ?.valueChanges.pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.statePatchValue();
      });
  }

  setFormValidations(): void {
    debounceValidator(this.addressPhoneForm, 'zipCode', [
      Validators.required,
      Validators.pattern('\\d{5}'),
    ]);
    debounceValidator(this.addressPhoneForm, 'primary', [
      Validators.required,
      Validators.pattern('\\(?\\d{3}\\)?(-)?\\d{3}(-)?\\d{4}'),
    ]);
    debounceValidator(this.addressPhoneForm, 'mobile', [
      Validators.pattern('\\(?\\d{3}\\)?(-)?\\d{3}(-)?\\d{4}'),
    ]);
  }

  applyMaskOnChange(): void {
    const primaryControl = this.addressPhoneForm.get('primary');
    const mobileControl = this.addressPhoneForm.get('mobile');
    const zipCodeControl = this.addressPhoneForm.get('zipCode');

    primaryControl?.valueChanges.subscribe((value) => {
      const maskedValue = applyPhoneMask(value as string);

      primaryControl?.patchValue(maskedValue, { emitEvent: false });
    });

    mobileControl?.valueChanges.subscribe((value) => {
      const maskedValue = applyPhoneMask(value as string);

      mobileControl?.patchValue(maskedValue, { emitEvent: false });
    });

    zipCodeControl?.valueChanges.subscribe((value) => {
      const maskedValue = applyZipCodeMask(value as string);

      zipCodeControl?.patchValue(maskedValue, { emitEvent: false });
    });
  }

  private statePatchValue(): void {
    this.addressPhoneForm.get('state')?.patchValue(this.currentStateValue, {
      emitEvent: false,
    });
  }

  get textMessagingForm(): FormGroup {
    return this.personService.textMessagingForm;
  }

  get notificationForm(): FormGroup {
    return this.personService.notificationForm;
  }

  get states(): [string, string][] {
    return Object.entries(this.StatesModel);
  }
}
