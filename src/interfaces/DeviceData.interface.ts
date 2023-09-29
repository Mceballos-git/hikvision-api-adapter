export interface DeviceData {
    AcsEvent: {
      searchID: string,
      totalMatches: number,
      responseStatusStrg: string,
      numOfMatches: number,
      InfoList: 
        [ DeviceEventData ]
    }                                   
}

export interface DeviceEventData {
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
  pictureURL: string,
}


