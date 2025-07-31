import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { PdfVerificationService } from 'src/app/services/files/pdf-verification.service';

@Component({
  selector: 'app-recent-firmas',
  imports: [NgApexchartsModule, MaterialModule],
  templateUrl: './recent-firmas.component.html',
  styleUrl: './recent-firmas.component.scss',
})
export class RecentFirmasComponent {
  stats: any[] = []; // Se usará para mostrar datos en el timeline

  constructor(private pdfVerificationService: PdfVerificationService) {}

  ngOnInit(): void {
    // Simulando una llamada al servicio con un archivo ficticio
    this.pdfVerificationService.verifyPdf(new File([], 'dummy.pdf')).subscribe(
      (result: Stats[]) => {
        console.log('Respuesta del servicio:', result);
        this.stats = result.map((stat) => ({
          title: `Firma: ${stat.Name}`,
          time: stat.SignDate,
          subtext: `Firmante: ${stat.Signer}`,
          color: stat.IsValid ? 'success' : 'danger', // success para firmas válidas, danger para inválidas
        }));
      },
      (error) => {
        console.error('Error al verificar el PDF:', error);
      }
    );
  }
}
