import { DeviceData, DeviceEventData } from "../interfaces/DeviceData.interface";
import { DatabaseEventData } from "../interfaces/DatabaseEventData.interface";
import { LastEventNumber, getLastEventfromDBBySerialNo, insertDataOnDB } from "./dbUtils";
import { getBase64ImageFromUrl, getDataFromDevice, getImageArrayBufferFromUrl, getImageBufferFromUrl } from "./digestAuthHandler";
import { saveYellowInLogFile } from "./saveInLogFile";
import { NUMERO_EMPRESA, NUMERO_SUCURSAL, DEVICE_1_URL } from '../../config.json'
import { saveImageOnDisk } from "./saveImageOnDisk";
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
    // Buscando eventos con ID mas alto que el de la DB
    const deviceData: DeviceData | undefined = await getDataFromDevice({
      searchResultPosition: 0,
      maxResults: 30,
      // startTime: '2023-01-01T00:00:00-03:00',
      // endTime: '2025-09-25T17:07:10-03:00'
      beginSerialNo: lastEventFromDB.serialNo + 1,
      endSerialNo: lastEventFromDB.serialNo + 150000,
    });


    if ( deviceData?.AcsEvent?.totalMatches ) { 

      // Extraigo el array de eventos del dispositivo
      eventDataArray = deviceData?.AcsEvent.InfoList;

      for ( const event of eventDataArray ) {
        try {

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
            type: event.type,
            serialNo: event.serialNo,
            userType: event.userType,
            currentVerifyMode: event.currentVerifyMode,
            mask: event.mask,
            numero_empresa:  parseInt(NUMERO_EMPRESA!),
            numero_sucursal: parseInt(NUMERO_SUCURSAL!),
            enviado: false,
            pictureURL: event.pictureURL,
            // pictureBuffer: pictureBuffer!
          }

          await insertDataOnDB(newEvent);

          const buffer = await getImageArrayBufferFromUrl( event.pictureURL );
          const resizedBuffer = await sharp( buffer )
          .resize({ width: 200 })
          .jpeg({
            quality: 60
          })
          .toBuffer();

          saveImageOnDisk(event.serialNo, resizedBuffer);

        } catch (error) {
          saveYellowInLogFile( `Error al obtener la imagen` + error);
        }
      }
    }
  } catch( error ) {
    saveYellowInLogFile( `Error de primer metodo: ` + error );
  };
}