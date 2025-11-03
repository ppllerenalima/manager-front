import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  // ✅ Mostrar mensaje genérico
  showMessage(
    title: string,
    message: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info'
  ): void {
    Swal.fire({
      title,
      text: message,
      icon,
      confirmButtonText: 'Aceptar',
    });
  }

  // ✅ Confirmación con callback opcional
  confirm(
    message: string,
    onConfirm?: () => void,
    title: string = '¿Estás seguro?'
  ): void {
    Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
  }

  // ✅ Helpers rápidos
  success(message: string, title: string = 'Éxito'): void {
    this.showMessage(title, message, 'success');
  }

  error(message: string, title: string = 'Error'): void {
    this.showMessage(title, message, 'error');
  }

  warning(message: string, title: string = 'Advertencia'): void {
    this.showMessage(title, message, 'warning');
  }

  info(message: string, title: string = 'Información'): void {
    this.showMessage(title, message, 'info');
  }
}