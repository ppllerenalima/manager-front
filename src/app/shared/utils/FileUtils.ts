export class FileUtils {
    static async loadUrlAsBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result.toString());
                } else {
                    reject("No se pudo convertir a base64.");
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Esto genera automáticamente el formato data:<mime>;base64
        });
    }

    /**
   * Obtiene una cadena base64 para usar en <img>, o retorna imagen por defecto si no hay datos válidos.
   * @param imageBase64 Cadena base64 o arreglo de cadenas base64.
   * @returns Cadena base64 con prefijo data:image o ruta imagen por defecto.
   */
    static getClienteImage(imageBase64: string | string[] | null | undefined): string {
        const image = Array.isArray(imageBase64) ? imageBase64[0] : imageBase64;

        if (!image || image.trim().length === 0) {
            return 'assets/images/profile/user-1.jpg'; // Imagen por defecto
        }

        if (image.startsWith('data:image')) {
            return image; // Ya tiene prefijo completo
        }

        // Si es base64 sin prefijo, agregamos prefijo jpeg (puedes cambiar a png si prefieres)
        return `data:image/jpeg;base64,${image}`;
    }


    private static convertBlobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]); // sin el encabezado data:image/png...
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Convierte una cadena a número. Retorna `undefined` si no es un número válido.
     * @param valor Cadena a convertir.
     */
    static parseToNumber(valor: string): number | undefined {
        const n = parseFloat(valor);
        return isNaN(n) ? undefined : n;
    }


    static base64ToUint8Array(base64: string): Uint8Array {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    static downloadFile(content: string | Blob, fileName: string, type: string = 'application/octet-stream') {
        const blob = content instanceof Blob ? content : new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
