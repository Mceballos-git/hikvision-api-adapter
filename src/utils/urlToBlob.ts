export const urlToBlob = async ( url: string ) => {

  // Realiza una solicitud HTTP GET para obtener la imagen
  await fetch( url )
    .then((response) => response.blob())
    .then((blob) => {
      // `blob` contiene la imagen en formato Blob
      return blob;
    })
    .catch((error) => {
      console.error('Error al obtener la imagen:', error);
    });

  }

export default urlToBlob;
