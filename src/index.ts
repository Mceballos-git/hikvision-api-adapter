import { backupLargeFiles } from "./utils/backupLargeFiles";
import { initDB } from "./utils/dbUtils";
import { getDataAndSaveInDB } from "./utils/getDataAndSaveInDB";
import { sendDataToServer } from "./utils/sendDataToServer";
var cron = require('node-cron');


// Programa la tarea para ejecutarse cada un minuto
const tareaCron = cron.schedule( process.env.TIMER_ACCESO_DISPOSITIVO, async () => {
  try {

    await initDB();             // Creo la DB si no existe
    await getDataAndSaveInDB(); // Lectura de datos del dispositivo y los grabo en DB
    await sendDataToServer();   // Envio data al servidor
    await backupLargeFiles();   // Realizo backup del LOG y de la DB cuando superan los valores configurados

  } catch (error) {
    console.error('Error en la tarea:', error);
  }
}, { scheduled: true });

// Inicia la tarea
tareaCron.start();

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  // Vuelve a iniciar la tarea después de un error
  tareaCron.start();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo no manejado:', reason);
  // Vuelve a iniciar la tarea después de un error de rechazo
  tareaCron.start();
});


 


