import { getDataFromDevice } from "./utils/digestAuthHandler";
import { LastEventNumber, getLastEventfromDB, initDB, insertDataOnDB } from "./utils/dbUtils";
import { DeviceData, EventData, NewEventData } from './interfaces/DeviceData.interface';
import { saveYellowInLogFile } from "./utils/saveInLogFile";
import { AxiosHeaders } from "axios";
import {urlToBlob} from './utils/urlToBlob'

var cron = require('node-cron');


initDB();
// startServer();

   
async function getData() {

  try {
    let eventDataArray: EventData[];

    // Extraigo el registro con ID mas alto de la DB
    let lastEventFromDB: LastEventNumber | null = await getLastEventfromDB();
    if ( !lastEventFromDB ) {
      lastEventFromDB = { serialNo: 1 };
    };

    // Realizo la llamada al dispositivo 
    // Buscando eventos con ID mas alto que el de la DB
    const deviceData: DeviceData | undefined = await getDataFromDevice({
      searchResultPosition: 0,
      maxResults: 15,
      beginSerialNo: lastEventFromDB.serialNo + 1,
      endSerialNo: lastEventFromDB.serialNo + 100,
    });


    if ( deviceData?.AcsEvent?.totalMatches ) { 

      // Extraigo el array de eventos del dispositivo
      eventDataArray = deviceData?.AcsEvent.InfoList;

      for ( const event of eventDataArray ) {
        const username = process.env.DEVICE_1_ADMIN_USERNAME;
        const password = process.env.DEVICE_1_ADMIN_PASSWORD;
        const pictureURL = event.pictureURL;

        // Cargo credenciales para poder acceder a la imagen
        const headers = new Headers({
          'Authorization': `Basic ${btoa( username + ':' + password )}`
        });

        // Convierto a BLOB e inserto el evento en la DB
        try {
          const pictureBlob: Blob | null = await urlToBlob( pictureURL, headers );

          if (pictureBlob) {

            let newEvent: NewEventData = {
              major: event.major,
              minor: event.minor,
              time: event.time,
              cardType: event.cardType,
              name: event.name,
              cardReaderNo: event.cardReaderNo,
              doorNo: event.doorNo,
              employeeNoString: event.employeeNoString,
              type: event.type,
              serialNo: event.serialNo,
              userType: event.userType,
              currentVerifyMode: event.currentVerifyMode,
              mask: event.mask,
              pictureBlob: pictureBlob
            }

            await insertDataOnDB(newEvent);
          }
        } catch (error) {
          saveYellowInLogFile( `Error al obtener la imagen` );
        }
      }
    }
  } catch( error ) {
    saveYellowInLogFile( `Error de primer metodo: ` + error );
  };
}


// Programa la tarea para ejecutarse cada un minuto

let tiempo = process.env.TIMER_ACCESO_DISPOSITIVO;
//"$tiempo"

const tareaCron = cron.schedule( process.env.TIMER_ACCESO_DISPOSITIVO, () => {
  try {
    getData(); //lectura de datos del lector y graba en sqlite

    // TODO  postDataToCheckpint()  //envia a api de chackpoint

    //TODO purga o verificar fecha para hacer purga





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

