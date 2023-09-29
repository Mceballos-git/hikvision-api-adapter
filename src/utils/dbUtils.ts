import { DatabaseEventData } from "../interfaces/DatabaseEventData.interface";
import { saveYellowInLogFile, saveGreenInLogFile, saveInLogFile } from "./saveInLogFile";
const sqlite3 = require('sqlite3');

export interface LastEventNumber {
  serialNo: number;
}

export interface LastEventString {
  time: string;
}

export interface EventCount {
  count: number;
}

const dbClose = async () => {
  const db = new sqlite3.Database('./db/events.db');
  db.close(( err: any ) => {
      if (err) {
        saveYellowInLogFile( 'Error al cerrar la conexión a la base de datos:' + err );
      } else {
        // saveGreenInLogFile('Conexión a la base de datos cerrada.');
      }
    });
};


export const initDB = async (): Promise<void> => {

  return new Promise( ( resolve, reject ) => {
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
                            "enviado BOOLEAN NOT NULL DEFAULT false," +
                            "pictureURL VARCHAR(200) NOT NULL DEFAULT ''," +
                            "pictureBuffer BLOB NOT NULL DEFAULT '');"

    db.run(createTableQuery, ( err: any ) => {
      if ( err ) {
        reject(saveYellowInLogFile( 'Error al crear la tabla:'+ err ));
      } else {
        resolve(saveGreenInLogFile( 'initDB OK' ));
      }
    });
    dbClose();
  });
  
};

export const retrieveDatabaseUnsubmittedRecords = async (): Promise<DatabaseEventData[]> => {
  return new Promise( ( resolve, reject ) => {
    const db = new sqlite3.Database('./db/events.db', sqlite3.OPEN_READWRITE);
    let sql = `SELECT * FROM events WHERE enviado = 0`;
    
    db.all(sql, [], ( err: Error, rows: DatabaseEventData[] ) => {
      if ( err ) {
        saveYellowInLogFile( 'Error consultando registros sin enviar en DB: '+ err.message );
        reject( err );
      } else {
        if ( rows ) {
          saveGreenInLogFile( 'Cantidad de registros sin enviar en DB: '+ rows.length );
        } else {
          saveYellowInLogFile( 'No hay registros sin enviar en la DB' );
        }
        resolve( rows );
      }
      dbClose();
    });
  })
};

export const retrieveDatabaseRecordsQuantity = async (): Promise<EventCount> => {
  return new Promise( ( resolve, reject ) => {
    const db = new sqlite3.Database('./db/events.db', sqlite3.OPEN_READWRITE);
    let sql = `SELECT COUNT(*) as count FROM events`;
    
    db.get(sql, [], ( err: Error, row: EventCount ) => {
      if ( err ) {
        saveYellowInLogFile( 'Error consultando cantidad de registros en DB: '+ err.message );
        reject( err );
      } else {
        if ( row && typeof row.count === 'number' ) {
          // saveGreenInLogFile( 'Cantidad de registros en DB: '+ row.count );
        } else {
          // saveYellowInLogFile( 'No hay registros en la DB' );
        }
        resolve( row );
      }
      dbClose();
    });
  })
};

export const deleteRecordsFromDB = async (): Promise<any> => {
  return new Promise( ( resolve, reject ) => {
    const db = new sqlite3.Database('./db/events.db', sqlite3.OPEN_READWRITE);
    let sql = `DELETE FROM events WHERE (serialNo != (SELECT MAX(serialNo) FROM events) AND (enviado = 1))`;
    
    db.run(sql, ( err: Error ) => {
      if ( err ) {
        reject( saveYellowInLogFile( 'Error borrando registros en DB: '+ err ) );
      } else {
        resolve( saveGreenInLogFile( 'Registros borrados correctamente' ) );
      }
      dbClose();
    });
  })
};

export const getLastEventfromDBBySerialNo = (): Promise<LastEventNumber | null> => {
  
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
      dbClose();
    });
  })
};

export const getLastEventfromDBByTime = (): Promise<LastEventString | null> => {
  
  return new Promise( ( resolve, reject ) => {
    const db = new sqlite3.Database('./db/events.db', sqlite3.OPEN_READWRITE);
    let sql = `SELECT time FROM events ORDER BY serialNo DESC LIMIT 1`;
    
    db.get(sql, [], ( err: Error, row: LastEventString ) => {
      if (err) {
        saveYellowInLogFile( 'Error consultando ultimo evento en DB: '+ err.message );
        reject(err);
      } else {
        if ( row ) {
          saveGreenInLogFile( 'Ultimo registro en DB: serialNo:'+ row.time );
        } else {
          saveYellowInLogFile( 'No se encontró ultimo evento en DB' );
        }
        resolve(row);
      }
      dbClose();
    });
  })
};


export const insertDataOnDB = async ( event: DatabaseEventData ): Promise<number | null> => {
  return new Promise( async ( resolve, reject ) => {
    let db = new sqlite3.Database('./db/events.db');
    const sql = `INSERT INTO events(major, minor, time, cardType, name, cardReaderNo, doorNo, employeeNoString, ` +
      `type, serialNo, userType, currentVerifyMode, mask, numero_empresa, numero_sucursal, enviado, pictureURL, pictureBuffer) ` +
      `VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
      event.numero_empresa,
      event.numero_sucursal,
      event.enviado,
      event.pictureURL,
      event.pictureBuffer
    ];

    await db.run(sql, values, function(err: any) {
      if ( err ) {
        saveYellowInLogFile( `Error al grabar el evento: serialNo ${ event.serialNo }` );
        reject( err )
      } else {
        saveInLogFile( `Evento grabado correctamente: serialNo ${ event.serialNo }` );
        resolve( event.serialNo );
      }
      dbClose();
    });
  })
}

export default [initDB, getLastEventfromDBBySerialNo, insertDataOnDB];
