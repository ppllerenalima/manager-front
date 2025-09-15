import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { SafeUrlPipe } from "../../../../pipe/safe-url.pipe";

@Component({
  selector: 'app-dialog-viewpdf',
  template: `
    <h2 mat-dialog-title>Vista de Comprobante</h2>
    <mat-dialog-content class="p-0">
      <iframe
        [src]="data.pdfUrl | safeUrl"
        width="100%"
        height="100%"
        style="border: none;"></iframe>
    </mat-dialog-content>
  `,
  imports: [MatDialogContent, SafeUrlPipe]
})
export class AppDialogViewpdfComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { pdfUrl: string }) {}
}
