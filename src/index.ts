import { getDataFromDevice } from "./utils/digestAuthHandler";
import { initDB } from "./utils/dbUtils";
import { startServer } from './utils/server';
import { DeviceData, EventData } from './interfaces/DeviceData.interface';
import urlToBlob from "./utils/urlToBlob";

var cron = require('node-cron');

const username = process.env.DEVICE_1_ADMIN_USERNAME;
const password = process.env.DEVICE_1_ADMIN_PASSWORD;

initDB();
startServer();

async function getData() {

  let deviceData: [EventData] | undefined;

  try {
    // Realizo la llamada al dispositivo
    const data: DeviceData | undefined = await getDataFromDevice({
      searchResultPosition: 0,
      maxResults: 30,
      beginSerialNo: 600,
      endSerialNo: 650,
    });

    // Extraigo el array de eventos
    deviceData = data?.AcsEvent.InfoList;

    // Recorro el array
    deviceData?.forEach( event => {

      const pictureURL = event.pictureURL;
      const headers = new Headers({
        'Authorization': `Basic ${btoa(username + ':' + password)}`
      });

      // Convierto cada URL de imagen a formato BLOB
      fetch( pictureURL, { headers: headers } )
        .then((response) => response.blob())
        .then((blob) => {
          console.log('Esto deberia ser un BLOB valido: ---> ', blob);
        })
        .catch((error) => {
          console.error('Error al obtener la imagen:', error);
        });
      
    });


  } catch (error) {
    console.log(error);    
  }
}

// Programa la tarea para ejecutarse cada un minuto
const tareaCron = cron.schedule('* * * * * *', () => {
  try {
    getData();
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










