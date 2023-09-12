import fs from 'fs';

export const saveInLogFile = async ( message: string ) => {
  fs.appendFile("LOG-TEST.txt", message + '\n', (err) => {
    if (err) {
      console.error('Error al guardar el log: ', err);
    } else {
      console.log('Log OK: ' + message);
    }
  });
}

export default saveInLogFile;
