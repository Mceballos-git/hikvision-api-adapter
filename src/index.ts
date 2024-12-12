import { backupLargeFiles } from "./utils/backupLargeFiles";
import { initDB } from "./utils/dbUtils";
import { getDataAndSaveInDB } from "./utils/getDataAndSaveInDB";
import { sendDataToServer } from "./utils/sendDataToServer";
import { TIMER_ACCESO_DISPOSITIVO } from '../config.json'
import { saveYellowInLogFile } from "./utils/saveInLogFile";
import { createAppFolders } from "./utils/createDirectorySynchronously";
var cron = require('node-cron');

//FaceID
//Docta2023
//192.168.2.5

// Programa la tarea para ejecutarse cada un minuto
let fechaDesde: string | undefined;


const tareaCron = cron.schedule( TIMER_ACCESO_DISPOSITIVO , async () => {
  console.log('fechaDesde', fechaDesde);
  
  try {
    createAppFolders();
    await initDB();             // Creo la DB si no existe
    fechaDesde = await getDataAndSaveInDB(fechaDesde); // Lectura de datos del dispositivo y los grabo en DB
    await sendDataToServer();   // Envio data al servidor
    await backupLargeFiles();   // Realizo backup del LOG y de la DB cuando superan los valores configurados

  } catch (error) {
    saveYellowInLogFile( 'Error en cron job: ' + error)
  }
}, { scheduled: true });

// Inicia la tarea
console.log('Inicio del proceso');




tareaCron.start();

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  saveYellowInLogFile('Error no capturado:' + err);
  // Vuelve a iniciar la tarea después de un error
  tareaCron.start();
});

process.on('unhandledRejection', (reason, promise) => {
  saveYellowInLogFile('Rechazo no manejado:' + reason);
  // Vuelve a iniciar la tarea después de un error de rechazo
  tareaCron.start();
});


 


