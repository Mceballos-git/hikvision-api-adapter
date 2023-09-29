export interface DatabaseEventData {
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
  pictureURL: string,
  pictureBuffer: Buffer,
}