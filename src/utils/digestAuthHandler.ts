import axios from "axios";
import crypto from "crypto";
import { saveYellowInLogFile, saveGreenInLogFile} from "./saveInLogFile";
import { DeviceData } from '../interfaces/DeviceData.interface';
import { DEVICE_1_URL, DEVICE_1_URI, DEVICE_1_ADMIN_USERNAME, DEVICE_1_ADMIN_PASSWORD } from '../../config.json';
import { buffer } from "stream/consumers";
const fs = require('fs');
const sharp = require('sharp');


// Configuración de la solicitud
const url      = DEVICE_1_URL;
const uri      = DEVICE_1_URI;
const username = DEVICE_1_ADMIN_USERNAME;
const password = DEVICE_1_ADMIN_PASSWORD;


export const getDataFromDevice = async ({ 
      searchResultPosition = 0,
      maxResults = 30,
      // startTime = '',
      // endTime = ''
      beginSerialNo = 0,
      endSerialNo = 0
}): Promise<DeviceData | undefined> => {

  
  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url );
  } catch ( error: any ) {
    // console.log( error );
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  if ( customHeaders === undefined ) {
    saveGreenInLogFile( new Date().toLocaleString() + ' - No hay comunicación con el dispositivo. Verifique IP' );
    return;
  }

  const authHeader = customHeaders ;
  const realmMatch = authHeader.match(/realm="([^"]+)"/);
  const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

  if ( realmMatch && nonceMatch ) {
    const realm = realmMatch[1];
    const nonce = nonceMatch[1];

    // Paso 2: Calcula el hash MD5 del username, realm y password
    const ha1 = crypto.createHash('md5')
      .update(`${username}:${realm}:${password}`)
      .digest('hex');

    // Paso 3: Genera un nonce contador (nc)
    const nc = '00000001';

    // Paso 4: Genera un valor cnonce
    const cnonce = crypto.randomBytes(16).toString('hex');

    // Paso 5: Calcula el hash MD5 del método HTTP y la URL
    const httpMethod = 'POST';
    const ha2 = crypto.createHash('md5')
      .update(`${httpMethod}:${uri}`)
      .digest('hex');

    // Paso 6: Calcula el hash MD5 de ha1, nonce, nc, cnonce, qop y ha2
    const qop = 'auth';
    const response = crypto.createHash('md5')
      .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
      .digest('hex');

    // Paso 7: Construye el encabezado de autenticación digest
    const authHeaderDigest = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;

    // Paso 8: Realiza la solicitud real con el encabezado de autenticación digest
    try {
      const { data } = await axios({
        method: httpMethod,
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeaderDigest,
        },
        data: JSON.stringify({
          "AcsEventCond": {
            "major": 5,
            "maxResults": maxResults,
            "minor": 75,
            "searchID": "1",
            "searchResultPosition": searchResultPosition,
            // "startTime": startTime,
            // "endTime": endTime,
            // "timeReverseOrder": true,;
            "beginSerialNo": beginSerialNo, 
            "endSerialNo": endSerialNo
          }})
      });
      
      let deviceData: DeviceData;
      let newEvents: number;
      deviceData = data;
      newEvents = deviceData.AcsEvent.InfoList?.length ? deviceData.AcsEvent.InfoList?.length : 0 ;

      if ( newEvents > 0 ) {
        saveGreenInLogFile( `Consulta a dispositivo Exitosa - ${ newEvents } registros nuevos` );
      } else {
        saveYellowInLogFile( `Consulta a dispositivo Exitosa - 0 registros nuevos` );
      }

      return deviceData;
    } catch (error) {
      saveYellowInLogFile( `Error en consulta a dispositivo: ` + error );
    }
  } else {
    saveYellowInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
  }
}


export const getBase64ImageFromUrl = async ( url: string, serialNo:number ): Promise<string | undefined> => {
  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url );
  } catch ( error: any ) {
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  if ( customHeaders === undefined ) {
    saveGreenInLogFile( new Date().toLocaleString() + ' - No hay comunicación con el dispositivo. Verifique IP' );
    return;
  }

  const authHeader = customHeaders ;
  const realmMatch = authHeader.match(/realm="([^"]+)"/);
  const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

  if ( realmMatch && nonceMatch ) {
    const realm = realmMatch[1];
    const nonce = nonceMatch[1];

    // Paso 2: Calcula el hash MD5 del username, realm y password
    const ha1 = crypto.createHash('md5')
      .update(`${username}:${realm}:${password}`)
      .digest('hex');

    // Paso 3: Genera un nonce contador (nc)
    const nc = '00000001';

    // Paso 4: Genera un valor cnonce
    const cnonce = crypto.randomBytes(16).toString('hex');

    // Paso 5: Calcula el hash MD5 del método HTTP y la URL
    const httpMethod = 'GET';
    const ha2 = crypto.createHash('md5')
      .update(`${httpMethod}:${uri}`)
      .digest('hex');

    // Paso 6: Calcula el hash MD5 de ha1, nonce, nc, cnonce, qop y ha2
    const qop = 'auth';
    const response = crypto.createHash('md5')
      .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
      .digest('hex');

    // Paso 7: Construye el encabezado de autenticación digest
    const authHeaderDigest = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;

    // Paso 8: Realiza la solicitud real con el encabezado de autenticación digest
    try {
      const headers = new Headers({
          'Authorization': authHeaderDigest
        });

      const response = await fetch(url, { headers: headers });
      const arrayBuffer = await response.arrayBuffer();        

      ////**** SE CAMBIO ESTO PARA NO USAR .then() YA QUE ES ASINCONO */
      // await sharp( arrayBuffer )
      //   .resize({ width: 200 })
      //   .jpeg({
      //     quality: 60
      //   })
      //   .toBuffer()
      //   .then( (data: Buffer) => {
      //     // 100 pixels wide, auto-scaled height

      //   // const randomNumber = Math.floor(Math.random() * 250);
      //   const outputPath = "src/images/imagen"; // Ruta donde deseas guardar el archivo
      //   fs.writeFileSync( outputPath + serialNo +'.jpg', data );
      //   console.log(`Imagen descargada y guardada en ${outputPath} ${serialNo}`);
      //   base64String = btoa(String.fromCharCode(...new Uint8Array(data)));
      // });

      let base64String = '';
      //verifico que la imagen no esté rota para poder guardar en disco y generar base64
      if(arrayBuffer.byteLength > 0){
        const buffer:Buffer = await sharp( arrayBuffer )
        .resize({ width: 200 })
        .jpeg({
          quality: 60
        })
        .toBuffer();

        console.log('buffer', buffer);

        const outputPath = "src/images/imagen"; // Ruta donde deseas guardar el archivo
        fs.writeFileSync( outputPath + serialNo +'.jpg', buffer );
        console.log(`Imagen descargada y guardada en ${outputPath} ${serialNo}`);
        base64String = btoa(String.fromCharCode(...new Uint8Array(buffer))); 
      }

      return base64String;
      
    } catch (error) {
      saveYellowInLogFile( `Error al generar imagen en Base64: ` + error );
    }
  } else {
    saveYellowInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
  }
}


export const getImageBufferFromUrl = async ( url: string ): Promise<Buffer | undefined> => {
  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url );
  } catch ( error: any ) {
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  if ( customHeaders === undefined ) {
    saveGreenInLogFile( new Date().toLocaleString() + ' - No hay comunicación con el dispositivo. Verifique IP' );
    return;
  }

  const authHeader = customHeaders ;
  const realmMatch = authHeader.match(/realm="([^"]+)"/);
  const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

  if ( realmMatch && nonceMatch ) {
    const realm = realmMatch[1];
    const nonce = nonceMatch[1];

    // Paso 2: Calcula el hash MD5 del username, realm y password
    const ha1 = crypto.createHash('md5')
      .update(`${username}:${realm}:${password}`)
      .digest('hex');

    // Paso 3: Genera un nonce contador (nc)
    const nc = '00000001';

    // Paso 4: Genera un valor cnonce
    const cnonce = crypto.randomBytes(16).toString('hex');

    // Paso 5: Calcula el hash MD5 del método HTTP y la URL
    const httpMethod = 'GET';
    const ha2 = crypto.createHash('md5')
      .update(`${httpMethod}:${uri}`)
      .digest('hex');

    // Paso 6: Calcula el hash MD5 de ha1, nonce, nc, cnonce, qop y ha2
    const qop = 'auth';
    const response = crypto.createHash('md5')
      .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
      .digest('hex');

    // Paso 7: Construye el encabezado de autenticación digest
    const authHeaderDigest = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;

    // Paso 8: Realiza la solicitud real con el encabezado de autenticación digest
    try {
      const headers = new Headers({
          'Authorization': authHeaderDigest
        });

      const response = await fetch(url, { headers: headers });
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return buffer;
      
    } catch (error) {
      saveYellowInLogFile( `Error al generar el Buffer de la imagen: ` + error );
    }
  } else {
    saveYellowInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
  }
}
