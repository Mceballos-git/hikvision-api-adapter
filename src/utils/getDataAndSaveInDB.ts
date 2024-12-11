import { DeviceData, DeviceEventData } from "../interfaces/DeviceData.interface";
import { DatabaseEventData } from "../interfaces/DatabaseEventData.interface";
import { LastEventNumber, getLastEventfromDBBySerialNo, insertDataOnDB } from "./dbUtils";
import { getDataFromDevice, getImageArrayBufferFromUrl } from "./digestAuthHandler";
import { saveYellowInLogFile } from "./saveInLogFile";
import { NUMERO_EMPRESA, NUMERO_SUCURSAL, DEVICE_1_URL, GRABAR_IMAGENES_LOCAL } from '../../config.json'
import { saveImageOnDisk } from "./saveImageOnDisk";
import { CLIENT_RENEG_LIMIT } from "tls";
const sharp = require('sharp');



const url      = DEVICE_1_URL;

export const getDataAndSaveInDB = async() => {

  try {
    let eventDataArray: DeviceEventData[];

    // Extraigo el registro con ID mas alto de la DB
    let lastEventFromDB: LastEventNumber | null = await getLastEventfromDBBySerialNo();
    if ( !lastEventFromDB ) {
      lastEventFromDB = { serialNo: 1 };
    };

    // let lastEventFromDB: LastEventString | null = await getLastEventfromDBByTime();
    // if ( !lastEventFromDB ) {
    //   lastEventFromDB = { time: '2023-01-01T00:00:00-03:00' };
    // };

    // Realizo la llamada al dispositivo 
    // Buscando eventos con ID mas alto que el ultimo de la DB

    


    // {
    //   searchResultPosition: 0,
    //   maxResults: 30,
    //   // startTime: '2023-01-01T00:00:00-03:00',
    //   beginSerialNo: lastEventFromDB.serialNo + 1,
    //   endSerialNo: lastEventFromDB.serialNo + 150000,
    // }

    const deviceData: DeviceData | undefined = await getDataFromDevice();

    //console.log('device data', deviceData);
    


    if ( deviceData?.AcsEvent?.totalMatches ) { 

      // Extraigo el array de eventos del dispositivo
      eventDataArray = deviceData?.AcsEvent.InfoList;

      for ( const event of eventDataArray ) {
          // const pictureBuffer: Buffer | undefined = await getImageBufferFromUrl( event.pictureURL )
          
        let newEvent: DatabaseEventData = {
          major: event.major,
          minor: event.minor,
          time: event.time,
          cardType: event.cardType,
          name: event.name,
          cardReaderNo: event.cardReaderNo,
          doorNo: event.doorNo,
          employeeNoString: event.employeeNoString,
          type: event.type ?? 1,
          serialNo: event.serialNo,
          userType: event.userType,
          currentVerifyMode: event.currentVerifyMode,
          mask: event.mask,
          numero_empresa:  parseInt(NUMERO_EMPRESA!),
          numero_sucursal: parseInt(NUMERO_SUCURSAL!),
          enviado: false,
          pictureURL: event.pictureURL ?? '',
          // pictureBuffer: pictureBuffer!
        }

        try {
          await insertDataOnDB(newEvent);
        } catch (error) {
          //console.log( error );
          saveYellowInLogFile(`Error al insertar registro serialNo:${event.serialNo} en DB`)            
        }

        try {
          if ( GRABAR_IMAGENES_LOCAL === "S" && event.pictureURL !== undefined ) {
            const buffer = await getImageArrayBufferFromUrl( event.pictureURL );
            if ( buffer!.byteLength > 0 ) {
              const resizedBuffer = await sharp( buffer )
              .resize({ width: 200 })
              .jpeg({
                quality: 60
              })
              .toBuffer();

              saveImageOnDisk( event.serialNo, resizedBuffer );
          }

          }
        } catch (error) {
          saveYellowInLogFile( `Error al procesar la imagen` + error );
        }
      }
    }
  } catch( error ) {
    saveYellowInLogFile( `Error de primer metodo: ` + error );
  };
}