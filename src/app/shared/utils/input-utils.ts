// shared/utils/input-utils.ts
import { FormControl } from '@angular/forms';

export class InputUtils {
  static sanitizeNumericInput(event: Event, control: FormControl, modelObject?: any, modelProp?: string): void {
    const input = event.target as HTMLInputElement;
    const cleanedValue = input.value.replace(/\D/g, '');

    if (input.value !== cleanedValue) {
      input.value = cleanedValue;
      control.setValue(cleanedValue);
    }

    if (modelObject && modelProp) {
      modelObject[modelProp] = cleanedValue;
    }
  }

  static allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ?? event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
