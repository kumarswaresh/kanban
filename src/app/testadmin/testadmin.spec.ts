import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { AddressPhoneFormComponent } from './address-phone-form.component';
import {
  FC,
  NGLX_UI_API_URLS,
  NglxVerboseInfoDirective,
  NotificationService,
  PersonModelMock,
  PersonProfile,
  PersonProfileService,
  SnackbarModel,
} from 'nglx-shared';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CoreModule } from '@wgu-edu/wgu-core';
import { SvgIconRegistryService } from 'angular-svg-icon';
import { AddressAndPhone } from '../../../shared/models/forms.model';
import { SmsOptInUpdate } from 'nglx-api';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddressPhoneFormComponent', () => {
  let component: AddressPhoneFormComponent;
  let fixture: ComponentFixture<AddressPhoneFormComponent>;
  let httpMock: HttpTestingController;
  const mockNotificationService: Partial<NotificationService> = {
    postSMSOptIn: jest.fn(),
    putNotificationSettings: jest.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddressPhoneFormComponent,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
        NglxVerboseInfoDirective,
      ],
      providers: [
        provideHttpClientTesting(),
        {
          provide: NGLX_UI_API_URLS,
          useValue: {
            apiUrls: {
              identityPersonProfile: '',
            },
          },
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: SvgIconRegistryService,
          useValue: { getSvgByName: jest.fn() },
        },
        PersonProfileService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressPhoneFormComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);
    global.URL.createObjectURL = jest.fn(() => 'mocked-url');

    component.addressPhoneForm = new FormGroup<FC<AddressAndPhone>>({
      streetAddress: new FormControl('', [Validators.required]),
      streetAddressLine2: new FormControl(''),
      state: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [
        Validators.required,
        Validators.pattern('\\d{5}'),
      ]),

      primary: new FormControl('', [
        Validators.required,
        Validators.pattern('\\(?[0-9]{3}\\)?(-)?[0-9]{3}(-)?[0-9]{4}'),
      ]),
      mobile: new FormControl('', [
        Validators.pattern('\\(?[0-9]{3}\\)?(-)?[0-9]{3}(-)?[0-9]{4}'),
      ]),
    });

    jest.spyOn(component, 'onMessagingSubmit');
    jest.spyOn(component, 'onNotificationsSubmit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form with default values', () => {
    component.ngOnInit();

    expect(component.addressPhoneForm.get('state')?.value).toBe('');
    expect(component.addressPhoneForm.get('city')?.value).toBe('');
    expect(component.addressPhoneForm.get('zipCode')?.value).toBe('');
    expect(component.addressPhoneForm.get('primary')?.value).toBe('');
    expect(component.addressPhoneForm.get('mobile')?.value).toBe('');

    expect(component.addressPhoneForm).toBeTruthy();
  });

  it('should test getPersonProfileDetails API', (done) => {
    component['personService'].getPersonProfileDetails().subscribe((res) => {
      if (res) {
        expect(res.wguId === PersonModelMock[0].wguId).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne((request) => {
      return request.url.includes('/v2/persons?showDetails=true');
    });
    expect(req.request.method).toBe('GET');
    req.flush(PersonModelMock);
  });

  it('should test handleSnackbarClose()', () => {
    component.handleSnackbarClose();

    expect(component.snackbar.status).toEqual(undefined);
  });

  describe('Contact Information and Address and Phone Number Form ', () => {
    beforeEach(() => {
      const personProfile = new PersonProfile(PersonModelMock[0]);
      component.identityPersonProfile = PersonModelMock[0];
      component.addressPhoneForm.enable();

      const mainAddress = personProfile.mainAddress;
      if (mainAddress) {
        component.addressPhoneForm.patchValue({
          state: mainAddress.subdivision,
          primary: personProfile.homeNumber?.number,
          mobile: personProfile.mobileNumber?.number,
          zipCode: mainAddress.postalCode,
          city: mainAddress.city,
          streetAddress: personProfile.mainAddressLines?.[0].entry,
        });
      }
    });

    it('should test handleAddressFormSubmit with no errors', () => {
      component.handleAddressFormSubmit();

      const req = httpMock.expectOne((request) => {
        return request.url.includes('/v2/persons');
      });

      expect(req.request.method).toBe('PATCH');
      req.flush({});

      expect(
        component.snackbar.msg ===
          'Address and Phones Numbers updated successfully.'
      ).toBeTruthy();
    });

    it('should test handleAddressFormSubmit with errors', () => {
      component.handleAddressFormSubmit();

      const req = httpMock.expectOne((request) => {
        return request.url.includes('/v2/persons');
      });

      expect(req.request.method).toBe('PATCH');
      req.flush('', {
        status: 0,
        statusText: 'Network Error',
      });

      expect(component.snackbar.status).toEqual(SnackbarModel.Error);
    });
  });

  it('should test setSnackBarInfo method', () => {
    component.setSnackBarInfo(
      'Address and Phones Numbers updated successfully.',
      SnackbarModel.Success
    );

    expect(component.snackbar.msg).toBe(
      'Address and Phones Numbers updated successfully.'
    );
    expect(component.snackbar.status).toBe(SnackbarModel.Success);
  });

  describe('should test uncheckTextMessagingSMSNotificationForms', () => {
    beforeEach(() => {
      component.addressPhoneForm = new FormGroup({
        streetAddress: new FormControl('', [Validators.required]),
        streetAddressLine2: new FormControl(''),
        state: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.pattern('\\d{5}'),
        ]),

        primary: new FormControl('', [
          Validators.required,
          Validators.pattern('\\(?\\d{3}\\)?(-)?\\d{3}(-)?\\d{4}'),
        ]),
        mobile: new FormControl('', [
          Validators.pattern('\\(?\\d{3}\\)?(-)?\\d{3}(-)?\\d{4}'),
        ]),
      });

      jest.spyOn(component, 'textMessagingForm', 'get').mockReturnValue(
        new FormGroup({
          checkBox: new FormControl(false),
        })
      );

      jest.spyOn(component, 'notificationForm', 'get').mockReturnValue(
        new FormGroup({
          smsCheckBox: new FormControl(false),
          pushCheckBox: new FormControl(false),
        })
      );
    });

    it('should uncheck smsCheckBox and pushCheckBox in notificationsForm and call onNotificationsSubmit if no mobilePhoneNumber and checkBox is false', () => {
      component.textMessagingForm.patchValue(
        { checkBox: false },
        { emitEvent: false }
      );

      component.notificationForm.patchValue(
        {
          smsCheckBox: true,
          pushCheckBox: true,
        },
        { emitEvent: false }
      );

      component.uncheckTextMessagingSMSNotificationForms();
      expect(component.notificationForm.get('smsCheckBox')?.value).toBe(false);
      expect(component.notificationForm.get('pushCheckBox')?.value).toBe(false);
      expect(component.onNotificationsSubmit).toHaveBeenCalled();
    });

    it('should handle successful SMS opt-in submission', (done) => {
      // Mock the successful API response
      const smsResponse = {
        smsOptedIn: true,
        wguId: '123-123-123-123',
        phoneNumber: '123456789',
        smsConfirmedDate: new Date('2024-10-21T17:14:55.987Z'),
        messagesPerMonth: 0,
        lastOptInSentDate: new Date('2024-10-21T17:14:55.987Z'),
        nextOptInSendDate: new Date('2024-10-21T17:14:55.987Z'),
        status: 'ok',
      } as SmsOptInUpdate;
      jest
        .spyOn(mockNotificationService, 'postSMSOptIn')
        .mockReturnValue(of(smsResponse));

      component.onMessagingSubmit();

      // Check that the form was disabled initially
      fixture.whenStable().then(async () => {
        expect(component.textMessagingForm.disabled).toBe(false);
      });

      // Expect SMS API call with the correct parameters
      fixture.whenStable().then(async () => {
        expect(mockNotificationService.postSMSOptIn).toHaveBeenCalledWith({
          smsOptedIn: false,
          phoneNumber: component.addressPhoneForm.get('mobile')?.value,
          messagesPerMonth: null,
        });
      });

      // After a successful response, check if the form is enabled again
      expect(component.textMessagingForm.enabled).toBeTruthy();
      expect(component.notificationForm.enabled).toBeTruthy();
      done();
    });

    it('should not call any methods if mobilePhoneNumber is present', () => {
      component.uncheckTextMessagingSMSNotificationForms();

      expect(component.onMessagingSubmit).not.toHaveBeenCalled();
      expect(component.onNotificationsSubmit).not.toHaveBeenCalled();
    });

    it('should check if streetAddress has error when empty', () => {
      component.addressPhoneForm.get('streetAddress')?.patchValue('');

      expect(
        component.addressPhoneForm.get('streetAddress')?.errors?.['required']
      ).toBeTruthy();
    });

    it('should check if streetAddress has not error when filled', () => {
      component.addressPhoneForm.get('streetAddress')?.patchValue('17 Ave NW');

      expect(
        component.addressPhoneForm.get('streetAddress')?.errors?.['required']
      ).toBeFalsy();
    });

    it('should check if city has error when empty', () => {
      component.addressPhoneForm.get('city')?.patchValue('');

      expect(
        component.addressPhoneForm.get('city')?.errors?.['required']
      ).toBeTruthy();
    });

    it('should check if city has not error when filled', () => {
      component.addressPhoneForm.get('city')?.patchValue('New York');

      expect(
        component.addressPhoneForm.get('city')?.errors?.['required']
      ).toBeFalsy();
    });

    it('should check if state has error when empty', () => {
      component.addressPhoneForm.get('state')?.patchValue('');

      expect(
        component.addressPhoneForm.get('state')?.errors?.['required']
      ).toBeTruthy();
    });

    it('should check if state has not error when filled', () => {
      component.addressPhoneForm.get('state')?.patchValue('Michigan');

      expect(
        component.addressPhoneForm.get('state')?.errors?.['required']
      ).toBeFalsy();
    });

    it('should check if zipCode has error when empty', () => {
      component.addressPhoneForm.get('zipCode')?.patchValue('');

      expect(
        component.addressPhoneForm.get('zipCode')?.errors?.['required']
      ).toBeTruthy();
    });

    it('should check if zipCode has not error when filled', () => {
      component.addressPhoneForm.get('zipCode')?.patchValue('222222');

      expect(
        component.addressPhoneForm.get('zipCode')?.errors?.['required']
      ).toBeFalsy();
    });

    it('should check if zipCode has error when zipCode is wrong', () => {
      component.addressPhoneForm.get('zipCode')?.patchValue('2222');

      expect(
        component.addressPhoneForm.get('zipCode')?.errors?.['pattern']
      ).toBeTruthy();
    });

    it('should check if zipCode has not error when zipCode is correct', () => {
      component.addressPhoneForm.get('zipCode')?.patchValue('22222');

      expect(
        component.addressPhoneForm.get('zipCode')?.errors?.['pattern']
      ).toBeFalsy();
    });

    it('should check if primary has error when empty', () => {
      component.addressPhoneForm.get('primary')?.patchValue('');

      expect(
        component.addressPhoneForm.get('primary')?.errors?.['required']
      ).toBeTruthy();
    });

    it('should check if zipCode has not error when filled', () => {
      component.addressPhoneForm.get('primary')?.patchValue('7651348942');

      expect(
        component.addressPhoneForm.get('primary')?.errors?.['required']
      ).toBeFalsy();
    });

    it('should check if primary phone has error when primary phone is wrong', () => {
      component.addressPhoneForm.get('primary')?.patchValue('856375134');

      expect(
        component.addressPhoneForm.get('primary')?.errors?.['pattern']
      ).toBeTruthy();
    });

    it('should check if primary phone has not error when primary phone is correct', () => {
      component.addressPhoneForm.get('primary')?.patchValue('7651348942');

      expect(
        component.addressPhoneForm.get('primary')?.errors?.['pattern']
      ).toBeFalsy();
    });

    it('should check if mobile phone has error when mobile phone is wrong', () => {
      component.addressPhoneForm.get('mobile')?.patchValue('856375134');

      expect(
        component.addressPhoneForm.get('mobile')?.errors?.['pattern']
      ).toBeTruthy();
    });

    it('should check if mobile phone has not error when mobile phone is correct', () => {
      component.addressPhoneForm.get('mobile')?.patchValue('7651348942');

      expect(
        component.addressPhoneForm.get('mobile')?.errors?.['pattern']
      ).toBeFalsy();
    });
  });

  it('should return true if the control has the specified error and is dirty', () => {
    component.addressPhoneForm.get('zipCode')?.setErrors({ pattern: true });
    component.addressPhoneForm.get('zipCode')?.markAsDirty();
    expect(component.getAddressPhoneFormError('zipCode', 'pattern')).toBe(true);
  });

  it('should return false if the control does not have the specified error', () => {
    component.addressPhoneForm.get('zipCode')?.setErrors(null);
    component.addressPhoneForm.get('zipCode')?.markAsDirty();
    expect(component.getAddressPhoneFormError('zipCode', 'pattern')).toBe(
      undefined
    );
  });

  it('should return false if the control is not dirty', () => {
    component.addressPhoneForm.get('zipCode')?.setErrors({ pattern: true });
    component.addressPhoneForm.get('zipCode')?.markAsPristine();
    expect(component.getAddressPhoneFormError('zipCode', 'pattern')).toBe(
      false
    );
  });

  it.each([
    {
      field: 'primary',
      input: '',
      expected: '',
    },
    {
      field: 'primary',
      input: '5630671926',
      expected: '563-067-1926',
    },
    {
      field: 'mobile',
      input: '',
      expected: '',
    },
    {
      field: 'mobile',
      input: '5630671926',
      expected: '563-067-1926',
    },
  ])(
    'should debounce $field control value',
    fakeAsync(
      ({
        field,
        input,
        expected,
      }: {
        field: string;
        input: string;
        expected: string;
      }) => {
        jest.useFakeTimers();
        component.preventChangeState();

        component.addressPhoneForm.get(field)?.setValue(input);
        jest.advanceTimersByTime(50);

        expect(component.addressPhoneForm.get(field)?.value).toBe(expected);

        jest.useRealTimers();
      }
    )
  );
});
