import axios from "axios";

import { CHECKPOINT_SERVER_URL, NUMERO_EMPRESA, NUMERO_SUCURSAL } from '../../config.json'
import { CheckpointEventData } from '../interfaces/CheckpointEventData.interface';
import { cleanTimeZoneFromFullDate, extractDateFromFullDate, extractTimeFromFullDate } from "./formatDate";
import { DatabaseEventData } from "../interfaces/DatabaseEventData.interface";
import { getBase64ImageFromUrl } from "./digestAuthHandler";
import { markRecordAsSent, retrieveDatabaseUnsubmittedRecords } from "./dbUtils"
import { saveGreenInLogFile, saveYellowInLogFile } from "./saveInLogFile";
import { CheckpointResponse, Item } from "../interfaces/CheckpointResponse.interface";


const checkpointURL  = CHECKPOINT_SERVER_URL;
const numeroEmpresa  = NUMERO_EMPRESA;
const numeroSucursal = NUMERO_SUCURSAL;

export const sendDataToServer = async (): Promise<void> => {
  return new Promise( async (resolve, reject) => {
    try {
      // Consulto los registros en DB que NO estan enviados
      const unsubmittedRecords: DatabaseEventData[] = await retrieveDatabaseUnsubmittedRecords();

      // Creo el array de eventos que voy a mandar
      let dataToSend: CheckpointEventData[] = [];

      if ( unsubmittedRecords.length > 0 ) {

        for await ( const event of unsubmittedRecords ) {
           
          const pictureData: string | undefined = await getBase64ImageFromUrl( event.pictureURL );

          let eventToSend: CheckpointEventData = {
            id: event.serialNo,
            empleado: parseInt(event.employeeNoString),
            hora: cleanTimeZoneFromFullDate( event.time )!,
            hora1: extractTimeFromFullDate( event.time )!,
            fecha: extractDateFromFullDate( event.time )!,
            empresa: parseInt( numeroEmpresa! ),
            sucursal: parseInt( numeroSucursal! ),
            imagen: pictureData!
          };

          //console.log(eventToSend);

          // Agrego el evento al array
          dataToSend.push( eventToSend );
        };
        // Envio un solo array con toda la informacion
        const response: CheckpointResponse = await axios.post( checkpointURL, dataToSend );
        console.log(response);

        // Checkeo que venga el array "items" en la respuesta
        if ( !response.items ) {
          console.log(dataToSend);
          reject( saveYellowInLogFile( 'Error al procesar los registros en Checkpoint' ) );
        };

        for ( const item of response.items ) {
          // Recorro la respuesta, todo item que traiga ID != 0, se graba como enviado
          if ( item.last_id != 0 ) await markRecordAsSent( item.last_id );
        };

        // Calculo cuantos registros OK hay en la respuesta del server
        const dataSendOk: Item[] = response.items.filter( (item) => item.last_id != 0 ); 

        resolve( saveGreenInLogFile(`${dataToSend.length} registros enviados -- ${dataSendOk.length} registros recibidos` ));
      } else {
        resolve( saveGreenInLogFile(`Sin registros nuevos para enviar` ));
      }
    } catch (error) {
      reject( saveYellowInLogFile( 'No se pudieron enviar los registros: ' + error))
    }
  })
}