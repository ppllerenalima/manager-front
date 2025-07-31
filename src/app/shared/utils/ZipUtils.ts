import JSZip from 'jszip';
import { FileUtils } from './FileUtils';

export class ZipUtils {
  static async extractXmlFromBase64Zip(base64Zip: string): Promise<{ xmlFileName: string, xmlContent: string }> {
    const byteArray = FileUtils.base64ToUint8Array(base64Zip);
    const zipBlob = new Blob([byteArray], { type: 'application/zip' });

    const zip = await new JSZip().loadAsync(zipBlob);

    // Filtra archivos .xml que NO comienzan con 'R'
    const targetXmlEntry = Object.keys(zip.files).find(name =>
      name.endsWith('.xml') && !name.startsWith('R')
    );

    if (!targetXmlEntry) {
      throw new Error('No se encontró archivo XML que no comience con "R" en el ZIP');
    }

    const xmlContent = await zip.files[targetXmlEntry].async('text');

    return { xmlFileName: targetXmlEntry, xmlContent };
  }

  static async extractXmlFromBlob(zipBlob: Blob): Promise<{ xmlFileName: string; xmlBlob: Blob }> {
    const zip = await JSZip.loadAsync(zipBlob);

    for (const fileName of Object.keys(zip.files)) {
      if (fileName.toLowerCase().endsWith('.xml')) {
        const fileData = await zip.files[fileName].async('blob');
        return {
          xmlFileName: fileName,
          xmlBlob: fileData,
        };
      }
    }

    throw new Error('No se encontró un archivo XML en el ZIP');
  }

  static async extractPdfFromBlob(zipBlob: Blob): Promise<{ pdfFileName: string; pdfBlob: Blob }> {
    const zip = await JSZip.loadAsync(zipBlob);

    for (const fileName of Object.keys(zip.files)) {
      if (fileName.toLowerCase().endsWith('.pdf')) {
        const fileData = await zip.files[fileName].async('blob');
        return {
          pdfFileName: fileName,
          pdfBlob: fileData,
        };
      }
    }

    throw new Error('No se encontró un archivo PDF en el ZIP');
  }

  // static async extractPdfFromBlob(zipBlob: Blob): Promise<{ pdfFileName: string, pdfBlob: Blob }> {
  //   const jszip = new JSZip();

  //   // Carga el ZIP desde el blob
  //   const zip = await jszip.loadAsync(zipBlob);

  //   // Encuentra el primer archivo .pdf
  //   const pdfFileEntry = Object.values(zip.files).find(file => file.name.toLowerCase().endsWith('.pdf'));

  //   if (!pdfFileEntry) {
  //     throw new Error('No se encontró ningún archivo PDF dentro del ZIP.');
  //   }

  //   // Extrae el archivo PDF como Blob
  //   const pdfBlob = await pdfFileEntry.async('blob');

  //   return {
  //     pdfFileName: pdfFileEntry.name,
  //     pdfBlob
  //   };
  // }

}

