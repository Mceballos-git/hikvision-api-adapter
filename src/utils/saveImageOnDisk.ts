const fs = require('fs');


export const saveImageOnDisk = ( serialNo: number, buffer: any) => {
  const outputPath = "./images/imagen"; // Ruta donde deseas guardar el archivo
  fs.writeFileSync( outputPath + serialNo +'.jpg', buffer );
  console.log(`Imagen descargada y guardada en ${outputPath} ${serialNo}`);
}
