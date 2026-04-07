import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  LOWERCASE_PATTERN,
  NUMBER_PATTERN,
  SPECIAL_PATTERN,
  UPPERCASE_PATTERN,
} from '../сonstants/validators.constant';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  passwordValidator(control: AbstractControl) {
    const password = control.value;
    const hasLowerCase = LOWERCASE_PATTERN.test(password);
    const hasUpperCase = UPPERCASE_PATTERN.test(password);
    const hasSpecialChar = SPECIAL_PATTERN.test(password);
    const hasNumber = NUMBER_PATTERN.test(password);

    const errors: any = {};
    if (!hasLowerCase) {
      errors.missingLowerCase = true;
    }
    if (!hasUpperCase) {
      errors.missingUpperCase = true;
    }
    if (!hasSpecialChar) {
      errors.missingSpecialChar = true;
    }
    if (!hasNumber) {
      errors.missingNumber = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}
