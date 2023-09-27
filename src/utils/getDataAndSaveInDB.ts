import { DeviceData, EventData, NewEventData } from "../interfaces/DeviceData.interface";
import { LastEventNumber, getLastEventfromDBBySerialNo, insertDataOnDB } from "./dbUtils";
import getDataFromDevice, { getImageFromUrl } from "./digestAuthHandler";
import { saveYellowInLogFile } from "./saveInLogFile";

 
export const getDataAndSaveInDB = async() => {

  try {
    let eventDataArray: EventData[];

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
        const pictureURL = event.pictureURL;

        // Convierto a BLOB e inserto el evento en la DB
        try {
          const pictureData: Buffer | undefined = await getImageFromUrl( pictureURL );

          if (pictureData) {

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
              pictureBlob: pictureData,
              numero_empresa:  parseInt(process.env.NUMERO_EMPRESA!),
              numero_sucursal: parseInt(process.env.NUMERO_SUCURSAL!),
              enviado: false
            }

            await insertDataOnDB(newEvent);
          }
        } catch (error) {
          saveYellowInLogFile( `Error al obtener la imagen` + error);
        }
      }
    }
  } catch( error ) {
    saveYellowInLogFile( `Error de primer metodo: ` + error );
  };
}