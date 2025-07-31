// src/app/utils/form-utils.ts
import { FormControl } from '@angular/forms';
import { WritableSignal, DestroyRef } from '@angular/core';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class FormUtils {
  static updateErrorMessage(
    control: FormControl,
    errorSignal: WritableSignal<string>,
    label: string,
    exactLength?: number
  ): void {
    if (control.hasError('required')) {
      errorSignal.set(`Debes ingresar ${label}`);
    } else if (control.hasError('minlength') || control.hasError('maxlength')) {
      errorSignal.set(`${label} debe tener exactamente ${exactLength} dígitos`);
    } else if (control.hasError('pattern')) {
      errorSignal.set(`${label} debe contener solo números`);
    } else {
      errorSignal.set('');
    }
  }

  static registerControlValidation(
    destroyRef: DestroyRef,
    control: FormControl,
    errorSignal: WritableSignal<string>,
    label: string,
    exactLength?: number
  ): void {
    merge(control.valueChanges, control.statusChanges)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        this.updateErrorMessage(control, errorSignal, label, exactLength);
      });
  }
}
