import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { SafeUrlPipe } from 'src/app/pipe/safe-url.pipe';

@Component({
  selector: 'app-pdf-viewer-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, SafeUrlPipe],
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrl: './pdf-viewer-dialog.component.scss',
  styles: [
    `
      .pdf-container {
        overflow: hidden;
      }
    `,
  ],
})
export class PdfViewerDialogComponent {
  pdfUrl: string;

  constructor(
    public dialogRef: MatDialogRef<PdfViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.pdfUrl = data.pdfUrl;
  }

  close(): void {
    this.dialogRef.close();
  }
}
