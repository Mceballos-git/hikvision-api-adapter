export interface DeviceData {
    AcsEvent: {
      searchID: string,
      totalMatches: number,
      responseStatusStrg: string,
      numOfMatches: number,
      InfoList: 
        [ EventData ]
    }                                   
}

export interface EventData {
  major: number,
  minor: number,
  time: string,
  cardType: number,
  name: string,
  cardReaderNo: number,
  doorNo: number,
  employeeNoString: string,
  type: number,
  serialNo: number,
  userType: string,
  currentVerifyMode: string,
  mask: string,
  pictureURL: string
}

export interface NewEventData {
  major: number,
  minor: number,
  time: string,
  cardType: number,
  name: string,
  cardReaderNo: number,
  doorNo: number,
  employeeNoString: string,
  type: number,
  serialNo: number,
  userType: string,
  currentVerifyMode: string,
  mask: string,
  numero_empresa: number,
  numero_sucursal: number,
  enviado: boolean,
  pictureBlob: Buffer
}

