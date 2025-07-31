import { Component, OnInit, Inject, Optional, signal, DestroyRef, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Customer } from './customer';
import { CustomerService } from 'src/app/services/apps/customer/customer.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { FileUtils } from 'src/app/shared/utils/FileUtils';
import { InputUtils } from 'src/app/shared/utils/input-utils';
import { FormUtils } from 'src/app/shared/utils/FormUtils';
import { Router } from '@angular/router';

// ---------------------------------
// INTERFACE CUSTOMER DATA
// ---------------------------------
export interface CustomerData {
  action: string;
  ruc: string;
  razonsocial: string;
  numero: string;
  direccion: string;
  image: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

// ---------------------------------
// COMPONENTE PRINCIPAL: AppCustomerComponent
// ---------------------------------
@Component({
  templateUrl: './customer.component.html',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    CommonModule,
  ],
})
export class AppCustomerComponent implements OnInit {
  // Señales para binding reactivo de formularios
  Ruc = signal<string>('');
  Razonsocial = signal<string>('');
  Numero = signal<string>('');
  Direccion = signal<string>('');
  ClientId = signal<string>('');
  ClientSecret = signal<string>('');
  Username = signal<string>('');
  Password = signal<string>('');

  // Datos para la tabla/lista de clientes
  customers = signal<Customer[]>([]);
  searchText = signal<string>('');
  totalItems = signal(0);

  // Paginación
  pageSize = 5;
  pageIndex = 0;

  // Utilidades
  FileUtils = FileUtils;

  constructor(
    public dialog: MatDialog,
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  // Carga la lista de clientes paginada
  loadCustomers() {
    this.customerService.getCustomers(this.searchText(), this.pageSize, this.pageIndex).subscribe({
      next: (res) => {
        this.customers.set(res.data);
        this.totalItems.set(res.total);
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Maneja evento de cambio de página
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCustomers();
  }

  // Abre el diálogo para agregar o editar un cliente
  openDialog(action: string, obj: Customer | any): void {
    obj.action = action;

    const dialogRef = this.dialog.open(AppCustomerDialogContentComponent, {
      data: obj,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result.event === 'Add') {
        this.addCustomer(result.data);
      } else if (result.event === 'Edit') {
        this.updateCustomer(result.data.id, result.data);
      } else if (result.event === 'Delete') {
        this.deleteCustomer(result.data.id);
      }
    });
  }

  openEditDialog(customer: Customer): void {
    this.openDialog('Edit', customer);
  }

  openDeleteDialog(customer: Customer): void {
    this.openDialog('Delete', customer);
  }

  goToCompras(customer: Customer): void {
    this.router.navigate([
      '/apps/customer/sirelist',
      customer.id,
      customer.username,
      customer.password
    ]);
  }

  // Filtro de búsqueda simple (puedes implementar backend o frontend)
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText.set(filterValue);
    // Implementar filtrado si es necesario
    this.loadCustomers();
  }

  // Añade un nuevo cliente enviando los datos al backend
  addCustomer(row_obj: any): void {
    const newCustomer: Customer = {
      ruc: row_obj.ruc,
      razonsocial: row_obj.razonsocial,
      numero: row_obj.numero,
      direccion: row_obj.direccion,
      image: row_obj.image,
      clientId: row_obj.clientId,
      clientSecret: row_obj.clientSecret,
      username: row_obj.username,
      password: row_obj.password,
    };

    this.customerService.add(newCustomer).subscribe({
      next: () => {
        this.loadCustomers();
        this.snackBar.open('¡Nuevo cliente añadido exitosamente!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al registrar cliente:', err);
        this.snackBar.open('Error al registrar cliente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  updateCustomer(Id: string, customer: Customer): void {
    this.customerService.update(Id, customer).subscribe({
      next: () => {
        this.loadCustomers();
        this.snackBar.open('¡Cliente actualizado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.snackBar.open('Error al actualizar cliente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteCustomer(Id: string): void {
    this.customerService.delete(Id).subscribe({
      next: () => {
        this.loadCustomers();
        this.snackBar.open('¡Cliente actualizado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.snackBar.open('Error al actualizar cliente', 'Cerrar', { duration: 3000 });
      }
    });
  }
}

// ---------------------------------
// COMPONENTE DEL DIÁLOGO DE CLIENTE
// ---------------------------------
@Component({
  selector: 'app-dialog-content',
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TablerIconsModule,
  ],
  templateUrl: 'customer-dialog-content.html',
})
export class AppCustomerDialogContentComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Formularios reactivos con validación
  readonly ruc = new FormControl('', [
    Validators.required,
    Validators.minLength(11),
    Validators.maxLength(11),
    Validators.pattern(/^\d+$/),
  ]);
  rucErrorMessage = signal('');

  readonly razonsocial = new FormControl('', [Validators.required]);
  razonSocialErrorMessage = signal('');

  // Datos locales y utilidades
  action: string;
  local_data: Customer | any;
  selectedFile: File | null = null;

  FormUtils = FormUtils;
  InputUtils = InputUtils;

  constructor(
    public dialogRef: MatDialogRef<AppCustomerDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: CustomerData
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action;

    FormUtils.registerControlValidation(this.destroyRef, this.ruc, this.rucErrorMessage, 'RUC', 11);
    FormUtils.registerControlValidation(this.destroyRef, this.razonsocial, this.razonSocialErrorMessage, 'Razón Social');
  }

  // Acción principal para cerrar diálogo enviando datos (espera a la conversión de archivo)
  async doAction(): Promise<void> {
    // Si ya hay una imagen cargada, no hacemos nada
    if (!this.local_data.image) {
      // Si no hay imagen cargada, usamos una por defecto
      const defaultBase64 = await FileUtils.loadUrlAsBase64('assets/images/profile/user-1.jpg');
      this.local_data.image = defaultBase64;
    }

    // Cierra el diálogo y envía los datos
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  // Cierra el diálogo sin cambios
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  // Evento para seleccionar archivo e imprimir base64 en local_data.image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.local_data.image = e.target?.result as string; // Base64 de imagen
      };

      reader.readAsDataURL(this.selectedFile);
    }
  }
}
