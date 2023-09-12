"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
require("dotenv/config");
const app = (0, express_1.default)();
// Configuración de la solicitud
const url = 'http://192.168.0.126/ISAPI/AccessControl/AcsEvent';
const username = 'admin';
const password = 'Docta2023';
// Paso 1: Realiza una solicitud GET para obtener los parámetros de autenticación digest
let customHeaders = '';
axios_1.default.get(url)
    .then(response => { console.log('RESPONSE: ', response); })
    .catch(error => {
    var _a;
    // console.log( 'ERROR: ', error.response.headers['www-authenticate'] );
    customHeaders = (_a = error.response) === null || _a === void 0 ? void 0 : _a.headers['www-authenticate'];
    const authHeader = customHeaders;
    const realmMatch = authHeader.match(/realm="([^"]+)"/);
    const nonceMatch = authHeader.match(/nonce="([^"]+)"/);
    if (realmMatch && nonceMatch) {
        const realm = realmMatch[1];
        const nonce = nonceMatch[1];
        // Paso 2: Calcula el hash MD5 del username, realm y password
        const ha1 = crypto_1.default.createHash('md5')
            .update(`${username}:${realm}:${password}`)
            .digest('hex');
        // Paso 3: Genera un nonce contador (nc)
        const nc = '00000001';
        // Paso 4: Genera un valor cnonce
        const cnonce = crypto_1.default.randomBytes(16).toString('hex');
        // Paso 5: Calcula el hash MD5 del método HTTP y la URL
        const httpMethod = 'post'; // Puedes cambiarlo según tu solicitud
        const uri = 'http://192.168.0.126/ISAPI/AccessControl/AcsEvent'; // Puedes cambiarlo según tu solicitud
        const ha2 = crypto_1.default.createHash('md5')
            .update(`${httpMethod}:${uri}`)
            .digest('hex');
        // Paso 6: Calcula el hash MD5 de ha1, nonce, nc, cnonce, qop y ha2
        const qop = 'auth';
        const response = crypto_1.default.createHash('md5')
            .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
            .digest('hex');
        // Paso 7: Construye el encabezado de autenticación digest
        const authHeaderDigest = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}", opaque=""`;
        // Paso 8: Realiza la solicitud real con el encabezado de autenticación digest
        (0, axios_1.default)({
            method: 'post',
            url: url,
            data: JSON.stringify({
                "AcsEventCond": {
                    "searchID": "1",
                    "searchResultPosition": 0,
                    "maxResults": 10,
                    "major": 0,
                    "minor": 0,
                    "timeReverseOrder": true
                }
            }),
            headers: {
                'Authorization': authHeaderDigest
            }
        }).then(response => {
            // Manejar la respuesta del servidor aquí
            console.log('RESP OK', response.data);
        })
            .catch(error => {
            console.error('RESP_ERROR', error);
        });
    }
    else {
        console.error('No se pudo obtener el encabezado WWW-Authenticate.');
    }
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
