import axios from "axios";
import crypto from "crypto";
require('dotenv').config()
import saveInLogFile from "./saveInLogFile";
import { DeviceData } from "../interfaces/DeviceData.interface";


// Configuración de la solicitud
const url      = process.env.DEVICE_1_URL as string;
const uri      = process.env.DEVICE_1_URI;
const username = process.env.DEVICE_1_ADMIN_USERNAME;
const password = process.env.DEVICE_1_ADMIN_PASSWORD;


export const getDataFromDevice = async ({ 
      searchResultPosition = 0,
      maxResults = 30,
      beginSerialNo = 1,
      endSerialNo = 564
}): Promise<DeviceData | undefined> => {

  
  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url );
    console.log( 'RESPONSE: ', response );
  } catch ( error: any ) {
    // console.log( error );
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  if ( customHeaders === undefined ) {
    saveInLogFile( new Date().toLocaleString() + ' - No se pudo obtener el encabezado WWW-Authenticate' );
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
          "timeReverseOrder": true,
          "beginSerialNo": beginSerialNo, 
          "endSerialNo": endSerialNo
        }})
      });
      
      saveInLogFile( new Date().toLocaleString() + ' - Consulta a dispositivo Exitosa.' );

      return data;
    } catch (error) {
      saveInLogFile( new Date().toLocaleString() + ' - Error en consulta a dispositivo: ' + error );
    }
  } else {
    saveInLogFile( new Date().toLocaleString() + ' - No se pudo obtener el encabezado WWW-Authenticate' );
  }
}

export default getDataFromDevice;


