import { DatabaseEventData } from "../interfaces/DatabaseEventData.interface";
import { retrieveDatabaseUnsubmittedRecords } from "./dbUtils"
import { getBase64ImageFromUrl } from "./digestAuthHandler";
import { CheckpointEventData } from '../interfaces/CheckpointEventData.interface';
import axios from "axios";



const checkpointURL = process.env.CHECKPOINT_SERVER_URL as string;

export const sendDataToServer = async (): Promise<any> => {
  return new Promise( async (resolve, reject) => {
    try {
      // Consulto los registros en DB que NO estan enviados
      const unsubmittedRecords: DatabaseEventData[] = await retrieveDatabaseUnsubmittedRecords();

      // Creo el array de eventos que voy a mandar
      let dataToSend: CheckpointEventData[] = [];
      
      for ( const event of unsubmittedRecords ) {

        const pictureData: string | undefined = await getBase64ImageFromUrl( event.pictureURL );

        let eventToSend: CheckpointEventData = {
          time: event.time,
          numero_empresa: event.numero_empresa,
          numero_sucursal: event.numero_sucursal,
          pictureBase64: pictureData!,
          name: event.name,
          employeeNoString: event.employeeNoString,

          // major: 0,
          // minor: 0,
          // cardType: 0,
          // cardReaderNo: 0,
          // doorNo: 0,
          // type: 0,
          // serialNo: 0,
          // userType: "",
          // currentVerifyMode: "",
          // mask: "",
          // enviado: false
        };

        dataToSend.push(eventToSend);
      }

      axios.post( checkpointURL, dataToSend );

      resolve(console.log(dataToSend));
      
    } catch (error) {
      
    }
    


  })

  
}