import { getDataFromDevice } from "./utils/digestAuthHandler";
import { createTableIfNotExists } from "./utils/dbUtils";
import { startServer } from './utils/server'


createTableIfNotExists();

startServer();


let resp: {} | undefined= {};

async function getData() {
  try {
    const data = await getDataFromDevice();
    resp = data;
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
}

resp = getData();
console.log(resp);



