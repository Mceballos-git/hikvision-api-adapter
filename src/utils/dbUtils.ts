import { EventData, NewEventData } from "../interfaces/DeviceData.interface";
import { saveYellowInLogFile, saveGreenInLogFile, saveInLogFile } from "./saveInLogFile";
const sqlite3 = require('sqlite3');

export interface LastEventNumber {
  serialNo: number;
}


export const initDB = () => {

  const db = new sqlite3.Database('./db/events.db');

  const createTableQuery = "CREATE TABLE IF NOT EXISTS events (id INTEGER primary key AUTOINCREMENT," +
                           "major INTEGER(4) NOT NULL DEFAULT '0'," +
                           "minor INTEGER(4) NOT NULL DEFAULT '0'," +
                           "time varchar(45) UNIQUE NOT NULL," +
                           "cardType INTEGER NOT NULL DEFAULT '1'," +
                           "name varchar(50) NOT NULL DEFAULT ''," +
                           "cardReaderNo INTEGER NOT NULL DEFAULT '0'," +
                           "doorNo INTEGER NOT NULL DEFAULT '0'," +
                           "employeeNoString varchar(10) NOT NULL DEFAULT '0'," +
                           "type INTEGER NOT NULL DEFAULT '0'," +      
                           "serialNo INTEGER NOT NULL UNIQUE," +
                           "userType varchar(20) NOT NULL DEFAULT ''," +
                           "currentVerifyMode varchar(20) NOT NULL DEFAULT ''," +
                           "mask varchar(10) NOT NULL DEFAULT ''," +
                           "numero_empresa INTEGER NOT NULL DEFAULT ''," +
                           "numero_sucursal INTEGER NOT NULL DEFAULT ''," +
                           "enviado BOOL NOT NULL DEFAULT false," +
                           "pictureURL BLOB NOT NULL DEFAULT '');"

  db.run(createTableQuery, ( err: any ) => {
    if ( err ) {
      saveYellowInLogFile( 'Error al crear la tabla:'+ err );
    } else {
      saveGreenInLogFile( 'Tabla creada correctamente' );
    }
  });

  db.close(( err: any ) => {
    if (err) {
      saveYellowInLogFile( 'Error al cerrar la conexión a la base de datos:' + err );
    } else {
      saveGreenInLogFile('Conexión a la base de datos cerrada.')
    }
  });
};


export const getLastEventfromDB = (): Promise<LastEventNumber | null> => {
  
  return new Promise( ( resolve, reject ) => {
    const db = new sqlite3.Database('./db/events.db', sqlite3.OPEN_READWRITE);
    let sql = `SELECT serialNo FROM events ORDER BY serialNo DESC LIMIT 1`;
    
    db.get(sql, [], ( err: Error, row: LastEventNumber ) => {
      if (err) {
        saveYellowInLogFile( 'Error consultando ultimo evento en DB: '+ err.message );
        reject(err);
      } else {
        if ( row ) {
          saveGreenInLogFile( 'Ultimo registro en DB: serialNo:'+ row.serialNo );
        } else {
          saveYellowInLogFile( 'No se encontró ultimo evento en DB' );
        }
        resolve(row);
      }
      db.close();
    });
  })
};


export const insertDataOnDB = async ( event: NewEventData ): Promise<number | null> => {
  return new Promise( async ( resolve, reject ) => {
    let db = new sqlite3.Database('./db/events.db');
    const sql = `INSERT INTO events(major, minor, time, cardType, name, cardReaderNo, doorNo, employeeNoString, ` +
      `type, serialNo, userType, currentVerifyMode, mask, pictureURL) ` +
      `VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      event.major,
      event.minor,
      event.time,
      event.cardType,
      event.name ? event.name : 'sin nombre',
      event.cardReaderNo,
      event.doorNo,
      event.employeeNoString,
      event.type,
      event.serialNo,
      event.userType,
      event.currentVerifyMode,
      event.mask,
      event.pictureBlob
    ];

    await db.run(sql, values, function(err: any) {
      if ( err ) {
        saveYellowInLogFile( `Error al grabar el evento: serialNo ${ event.serialNo }` );
        reject( err )
      } else {
        saveInLogFile( `Evento grabado correctamente: serialNo ${ event.serialNo }` );
        resolve( event.serialNo );
      }
      db.close();
    });
  })
}

export default [initDB, getLastEventfromDB, insertDataOnDB];
