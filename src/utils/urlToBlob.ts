import { saveYellowInLogFile } from "./saveInLogFile";

// export const urlToBlob = async ( url, headers ) => {
export const urlToBlob = async ( url: string, headers: Headers ): Promise<Blob> => {

  return await new Promise( async ( resolve, reject ) => {
    try {
      const response = await fetch(url, { headers: headers });




      const blob = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg'; // Valor predeterminado si no se encuentra el encabezado Content-Type;
      
      let base64String = `data:${contentType};base64,${Buffer.from(blob,).toString('base64')}`;

      base64String = base64String.replace(/^data:/, '');

      const typeMatch = base64String.match(/image\/[^;]+/);
      const type = typeMatch ? typeMatch[0] : 'image/jpeg'; // Valor predeterminado si no hay coincidencia
      
      const base64 = base64String.replace(/^[^,]+,/, '');
      const arrayBuffer = new ArrayBuffer(base64.length);
      const typedArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < base64.length; i++) {
          typedArray[i] = base64.charCodeAt(i);
      }

      resolve( new Blob([arrayBuffer], {type}) );
    } catch ( error ) {
      reject( error );
    }
  })
}

export default urlToBlob;
