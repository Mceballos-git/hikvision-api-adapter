import { getDataFromDevice } from "./utils/digestAuthHandler";
import { createTableIfNotExists } from "./utils/dbUtils";
import { startServer } from './utils/server'


createTableIfNotExists();

startServer();

getDataFromDevice().then( response => console.log(response) );










