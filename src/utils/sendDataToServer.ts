import { DatabaseEventData } from "../interfaces/DatabaseEventData.interface";
import { markRecordAsSent, retrieveDatabaseUnsubmittedRecords } from "./dbUtils"
import { getBase64ImageFromUrl } from "./digestAuthHandler";
import { CheckpointEventData } from '../interfaces/CheckpointEventData.interface';
import axios from "axios";
import { cleanTimeZoneFromFullDate, extractDateFromFullDate, extractTimeFromFullDate } from "./formatDate";
import { saveGreenInLogFile, saveYellowInLogFile } from "./saveInLogFile";



const checkpointURL = process.env.CHECKPOINT_SERVER_URL as string;
const numeroEmpresa = process.env.NUMERO_EMPRESA;
const numeroSucursal = process.env.NUMERO_SUCURSAL;

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

          dataToSend.push( eventToSend );
        }
        const response = await axios.post( checkpointURL, dataToSend );
        // console.log(response);

        for ( const event of unsubmittedRecords ) {
          markRecordAsSent( event.serialNo );
        }
        resolve(saveGreenInLogFile( `${dataToSend.length} registros enviados correctamente` ));
      } else {
        resolve(saveGreenInLogFile( `Sin registros nuevos para enviar` ));
      }
    } catch (error) {
      reject( saveYellowInLogFile( 'No se pudieron enviar los registros: ' + error))
    }
    


  })

  
}