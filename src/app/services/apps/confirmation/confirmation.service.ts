import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  confirmAndExecute<T>(
    mensaje: string,
    servicio: Observable<T>,
    onSuccess: (res: T) => void,
    successMessage?: string
  ): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        servicio.subscribe({
          next: (res) => {
            onSuccess(res);
            if (successMessage) {
              Swal.fire('Éxito', successMessage, 'success');
            }
          },
          error: (err) => {
            console.error('Error al ejecutar acción', err);
            Swal.fire(
              'Error',
              'Ocurrió un error al procesar la acción.',
              'error'
            );
          },
        });
      }
    });
  }
}
