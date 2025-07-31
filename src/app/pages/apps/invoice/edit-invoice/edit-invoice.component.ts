import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService } from 'src/app/services/apps/invoice/invoice.service';
import { InvoiceList, order } from '../invoice';
import {
  UntypedFormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OkDialogComponent } from './ok-dialog/ok-dialog.component';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';

import * as jQuery from 'jquery';
import { PdfViewerDialogComponent } from './pdf-viewer-dialog/pdf-viewer-dialog.component';
import { MatSelectChange } from '@angular/material/select';

declare function startSignature(
  port: string,
  base64String: string
): Promise<void>; // Declaración de la función global

var jqFirmaPeru: any;

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  imports: [
    MaterialModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
})
export class AppEditInvoiceComponent implements OnInit {
  id = signal<any>(null);
  subTotal = signal<number>(0);
  vat = signal<number>(0);
  grandTotal = signal<number>(0);
  addForm: UntypedFormGroup | any;
  invoice = signal<InvoiceList | any>([]);
  archivoSeleccionado: File | null = null; // Variable para almacenar el archivo

  selectedFile: string = ''; // Valor seleccionado en el `<select>`
  selectedFileFirmado: string = ''; // Valor seleccionado en el `<select>`
  FileSearchSign: string = '';

  selectedFilePath: string = '';

  stats: any[] = [];

  constructor(
    activatedRouter: ActivatedRoute,
    private invoiceService: InvoiceService,
    private router: Router,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) {
    this.id.set(activatedRouter.snapshot.paramMap.get('id'));
    this.loadInvoice(); // Load invoice here
    this.subTotal.set(this.invoice()?.totalCost || 0);
    this.vat.set(this.invoice()?.vat || 0);
    this.grandTotal.set(this.invoice()?.grandTotal || 0);
  }

  ngOnInit(): void {
   
  }

  loadInvoice(): void {
    const invoiceData = this.invoiceService
      .getInvoiceList()
      .find((x) => x.id === +this.id());
    this.invoice.set(invoiceData); // Set the invoice signal
  }

  trackByFn(index: number, item: any): string {
    return item.title; // Usamos el campo title como clave única
  }
}
