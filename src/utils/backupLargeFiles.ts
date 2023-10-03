import fs from 'fs/promises';
import { rename, copyFile } from 'node:fs';
import { saveGreenInLogFile, saveYellowInLogFile } from './saveInLogFile';
import { deleteRecordsFromDB, retrieveDatabaseRecordsQuantity } from './dbUtils';
import { BACKUP_LOG_IN_MEGABYTES, BACKUP_DB_ON_RECORDS_QUANTITY } from '../../config.json'



export const backupLargeFiles = async (): Promise<void> => {
  return new Promise( async (resolve, reject) => {
    try {
      // Verifico tamaño del archivo de logs
      const stats = await fs.stat('./logs/log.txt');
      const fileSizeInBytes = stats.size;
      const fileSizeInMegaBytes = fileSizeInBytes / (1024 * 1024);

      const date  = new Date();
      const year  = date.getFullYear();
      const month = date.getMonth();
      const day   = date.getDay();

      // Constato el tamaño del archivo de log en MB y lo comparo con la variable de entorno
      if ( fileSizeInMegaBytes > parseInt( BACKUP_LOG_IN_MEGABYTES! ) ) {
        // Renombro el archivo y lo muevo a la carpeta logs/backups
        rename( './logs/log.txt', `./logs/backups/log-${day}-${month}-${year}.txt`, ( err ) => {
          if ( err ) reject( saveYellowInLogFile( 'Error al renombrar log: ' + err ) );
          resolve(saveGreenInLogFile( `Backup de log completo -> ./logs/backups/log-${day}-${month}-${year}.txt` ));
        });
      };
      
      // Cuento la cantidad de registros de la DB y lo comparo con la variable de entorno
      const dbRecordsCount = await retrieveDatabaseRecordsQuantity();
      if ( dbRecordsCount.count > parseInt( BACKUP_DB_ON_RECORDS_QUANTITY! )) {
        // Renombro y copio la DB a la carpeta db/backups
        copyFile( './db/events.db', `./db/backups/events-${day}-${month}-${year}.db`, ( err ) => {
          if ( err ) reject( saveYellowInLogFile( 'Error al renombrar DB: ' + err ) );
          resolve( saveGreenInLogFile(`Backup de DB completo -> ./db/backups/events-${day}-${month}-${year}.db` ));
        });
        // Elimino todos los registros de la DB, menos el ultimo y los que no han sido enviados
        await deleteRecordsFromDB();
      };

    } catch ( err ) {
      saveYellowInLogFile( 'Error al realizar backup: ' + err );
    }
  });
}