let
    jqFirmaPeru = jQuery.noConflict(true);
    

function signatureInit() {
    //Aqui se puede poner un preload
    alert('PROCESO INICIADO');
}

function signatureOk() {
    //Cancelar el preload
    alert('DOCUMENTO FIRMADO')
}

function signatureCancel() {
    //Cancelar el preload
    alert('OPERACION CANCELADA');
}

//Funciones del integrador
async function sendParam() {
    const select = document.getElementById('cbo_archivo');
    const param_token = select.value.split('.').slice(0, -1).join('.');

    const param = {
        param_url: `${url}/api/Firma/param`,
        param_token,
        document_extension: 'pdf'
    };

    console.log('==> Param:', param);

    const jsonString = JSON.stringify(param);
    console.log('==> jsonString:', jsonString);

    const base64String = toBase64(jsonString);
    console.log('==> base64String:', base64String);

    const port = '48596';
    await startSignature(port, base64String); // Llamar a la función de firma digital con los datos en Base64
}
