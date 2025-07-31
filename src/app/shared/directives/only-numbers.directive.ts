import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]' // Esto es lo que usarás en el HTML
})
export class OnlyNumbersDirective {
  // Evita escribir letras u otros caracteres
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const charCode = event.which ?? event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Limpia lo que se pega (ej. Ctrl+V con letras)
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '');
    if (input.value !== cleaned) {
      input.value = cleaned;
    }
  }
}
