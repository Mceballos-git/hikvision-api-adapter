import { saveYellowInLogFile } from "./saveInLogFile"


export const cleanTimeZoneFromFullDate = ( date: string ): string | undefined=> {

    try {
      if ( date.length === 25 ) {
        return date.slice(0, 19);
      };
    } catch ( error ) {
      saveYellowInLogFile( 'Error en cleanTimeZoneFromFullDate: ' + error );
    }
};

export const extractDateFromFullDate = ( date: string ): string | undefined => {

    try {
      if ( date.length === 25 ) {
        return date.slice(0, 10);
      };
    } catch ( error ) {
      saveYellowInLogFile( 'Error en extractDateAndTimeFromFullDate: ' + error );
    }
};

export const extractTimeFromFullDate = ( date: string ): string | undefined => {

    try {
      if ( date.length === 25 ) {
        return date.slice(11, 19);
      };
    } catch ( error ) {
      saveYellowInLogFile( 'Error en extractTimeFromFullDate: ' + error );
    }
};