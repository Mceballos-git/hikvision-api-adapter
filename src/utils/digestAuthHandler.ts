import axios from "axios";
import crypto from "crypto";
import { saveYellowInLogFile, saveGreenInLogFile} from "./saveInLogFile";
import { DeviceData } from '../interfaces/DeviceData.interface';
import { DEVICE_1_URL, DEVICE_1_URI, DEVICE_1_ADMIN_USERNAME, DEVICE_1_ADMIN_PASSWORD, DEVICE_1_IP_ADDRESS , MINOR} from '../../config.json';
import { saveImageOnDisk } from "./saveImageOnDisk";
const fs = require('fs');
const sharp = require('sharp');


// Configuración de la solicitud
const url      = DEVICE_1_URL;
const uri      = DEVICE_1_URI;
const username = DEVICE_1_ADMIN_USERNAME;
const password = DEVICE_1_ADMIN_PASSWORD;

// { 
//   searchResultPosition = 0,
//   maxResults = 30,
//   // startTime = '',
//   // endTime = ''
//   beginSerialNo = 0,
//   endSerialNo = 0
// }


export const getDataFromDevice = async (): Promise<DeviceData | undefined> => {

  
  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url );
  } catch ( error: any ) {
    //console.log( 'error al obtener param  auth',error );
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  if ( customHeaders === undefined ) {
    saveGreenInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
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
    //console.log(authHeaderDigest);
    //console.log(url);
    
    // Paso 8: Realiza la solicitud real con el encabezado de autenticación digest

    const fecha = new Date();
    let fecha_hoy = new Date();
    let fecha_ant = new Date(fecha.setDate(fecha.getDate() - 7));

    const dia_ant = String(fecha_ant.getDate()).padStart(2, '0');
    const mes_ant = String(fecha_ant.getMonth() + 1).padStart(2, '0');
    const anio_ant = String(fecha_ant.getFullYear());
    const fecha_ant_db = `${anio_ant}-${mes_ant}-${dia_ant}T00:00:01-03:00`;

    const dia_hoy = String(fecha_hoy.getDate()).padStart(2, '0');
    const mes_hoy = String(fecha_hoy.getMonth() + 1).padStart(2, '0');
    const anio_hoy = String(fecha_hoy.getFullYear());
    const fecha_hoy_db = `${anio_hoy}-${mes_hoy}-${dia_hoy}T23:59:58-03:00`;



    let filtros = JSON.stringify({
      "AcsEventCond": {
        "major": 5,
        "maxResults": 30,
        //"minor": 75, FaceID
        //"minor": 38, Huella
        "minor": MINOR,
        "searchID": "1",
        "searchResultPosition": 0,
        "startTime": fecha_ant_db,
          "endTime": fecha_hoy_db,
          "timeReverseOrder": true,
        //"startTime": '2024-12-10T01:24:00-03:00',
        //"endTime": '2024-12-12T00:23:52-03:00',
        // "timeReverseOrder": true,;
        //"beginSerialNo": 1, 
        //"endSerialNo": 160
      }});

      console.log(filtros);
      
      
      // const filtros1 = JSON.stringify({
      //   "AcsEventCond": {
      //     "searchID": "1",
      //     "searchResultPosition": searchResultPosition,
      //     "maxResults": maxResults,
      //     //"startTime": '2024-12-11T00:24:00-03:00',
      //     //"endTime": '2024-12-11T17:23:52-03:00',
      //     "startTime": fecha_ant,
      //     "endTime": fecha_hoy,
      //     "beginSerialNo": 1, 
      //     "endSerialNo": 500,
      //     "major": 5,
      //     "minor": 0,
      //   }});
    try {
      const { data } = await axios({
        method: httpMethod,
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeaderDigest,
        },
        data: filtros
      });
      
      
      

      //console.log(data);
      
      
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


export const getBase64ImageFromUrl = async ( url: string ): Promise<string | undefined> => {
  

  //arreglo url que viene de la DB para que tome la IP "actual" el lector, por las dudas haya cambiado
  let vector = url.split("/");
  let carpetas_url = "";
  for (let i = 3; i < vector.length; i++) {
    
    carpetas_url+=vector[i] + "/";
  }
  const ult_barra = carpetas_url.lastIndexOf("/");
  //quito la ultima barra
  const url1 = carpetas_url.substring(0, ult_barra );
  const url_arreglada = DEVICE_1_IP_ADDRESS + url1;
  // console.log(`Accediendo a ${url_arreglada}`);


  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url_arreglada );
  } catch ( error: any ) {
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  if ( customHeaders === undefined ) {
    saveGreenInLogFile( 'Error al acceder a imagen del dispositivo. Verifique IP' );
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
      const headers = new Headers({
          'Authorization': authHeaderDigest
        });

    try {
      const response = await fetch(url_arreglada, { headers: headers });
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

      let base64String = "";
      //verifico que la imagen no esté rota para poder guardar en disco y generar base64
      if ( arrayBuffer.byteLength > 0 ) {
        try {
          const buffer:Buffer = await sharp( arrayBuffer )
          .resize({ width: 500 })
          .jpeg({
            quality: 80
          })
          .toBuffer();

          // saveImageOnDisk( serialNo, buffer )

          return base64String = btoa(String.fromCharCode(...new Uint8Array(buffer))); 
        } catch (error) {
          return base64String;
        }
      }

      return base64String;
      
    } catch (error) {
      saveYellowInLogFile( `Error al generar imagen en Base64: ` + error );
    }
  } else {
    saveYellowInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
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
    saveGreenInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
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

export const getImageArrayBufferFromUrl = async ( url: string ): Promise<ArrayBuffer | undefined> => {
  let customHeaders = '';
  // Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
  try {
    const response = await axios.get( url );
  } catch ( error: any ) {
    customHeaders = error.response?.headers['www-authenticate']; 
  }

  // if ( customHeaders === undefined ) {
  //   saveGreenInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
  //   return;
  // }

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

      return arrayBuffer;
      
    } catch (error) {
      saveYellowInLogFile( `Error al generar el Buffer de la imagen: ` + error );
    }
  } else {
    saveYellowInLogFile( 'No hay comunicación con el dispositivo. Verifique IP' );
  }
}
