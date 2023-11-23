import { saveGreenInLogFile, saveYellowInLogFile } from "./saveInLogFile";
const fs = require('fs');

const createDirectorySynchronously = async ( directoryPath: string ) => {
  if ( !fs.existsSync( directoryPath ) ) {
    try {
      await fs.mkdirSync(directoryPath, { recursive: true });
      saveGreenInLogFile(`Directorio creado: ${directoryPath}`);
    } catch (error) {
      saveYellowInLogFile(`Error al crear el directorio: ${error}`);
    }
  }
};

export const createAppFolders = async () => {
  try {
    createDirectorySynchronously('./images/');
    createDirectorySynchronously('./db/');
    createDirectorySynchronously('./db/backups/');
    createDirectorySynchronously('./logs/');
    createDirectorySynchronously('./logs/backups/');
  } catch (error) {
    saveYellowInLogFile('No se pudieron crear los directorios');
  }
  
}