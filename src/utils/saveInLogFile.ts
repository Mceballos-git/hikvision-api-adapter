import fs from 'fs';

export const saveGreenInLogFile = async ( message: string ) => {
  fs.appendFile("LOG-TEST.txt", new Date().toLocaleString() + ' - ' + message + '\n', (err) => {
    if (err) {
      console.error( '\x1b[31m%s\x1b[0m', new Date().toLocaleString() + ' - Error al guardar el log: ', err );
    } else {
      // console.log( new Date().toLocaleString() + ' - ' + message );
      console.log( '\x1b[32m%s\x1b[0m', new Date().toLocaleString() + ' - ' + message )
    }
  });
}


export const saveYellowInLogFile = async ( message: string ) => {
  fs.appendFile("LOG-TEST.txt", new Date().toLocaleString() + ' - ' + message + '\n', (err) => {
    if (err) {
      console.error( '\x1b[31m%s\x1b[0m', new Date().toLocaleString() + ' - Error al guardar el log: ', err );
    } else {
      console.log( '\x1b[33m%s\x1b[0m', new Date().toLocaleString() + ' - ' + message )
    }
  });
}

export const saveInLogFile = async ( message: string ) => {
  fs.appendFile("LOG-TEST.txt", new Date().toLocaleString() + ' - ' + message + '\n', (err) => {
    if (err) {
      console.error( new Date().toLocaleString() + ' - Error al guardar el log: ', err );
    } else {
      console.log( new Date().toLocaleString() + ' - ' + message )
    }
  });
}

export default [ saveGreenInLogFile, saveYellowInLogFile, saveInLogFile ]
