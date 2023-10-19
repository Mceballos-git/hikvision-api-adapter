import { saveInLogFile, saveYellowInLogFile } from "./saveInLogFile";

const fs = require('fs');


export const saveImageOnDisk = ( serialNo: number, buffer: any ) => {
  const outputPath = "./images/imagen"; // Ruta donde deseas guardar el archivo
  try {
    fs.writeFileSync( outputPath + serialNo +'.jpg', buffer );
    saveInLogFile(`Imagen descargada y guardada en ${outputPath} ${serialNo}`);
  } catch (error) {
    saveYellowInLogFile(`Error al guardar imagen${serialNo} en disco`);
  };
};
