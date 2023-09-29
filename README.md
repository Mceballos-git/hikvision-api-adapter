<p align="center">
  <a target="blank"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVh4Ht3ndG_Oin4IWpBgsdFi75OoHvjSNsgQ&usqp=CAU" width="400" alt="Hikvision" /></a>
</p>


# HIKVISION API ADAPTER
Aplicacion de Node para la recoleccion de eventos de un Recognition Face Terminal.<br>
Marca: Hikvision<br>
Modelo: DS-K1T343MWX

## Tabla de contenidos

### Datos tecnicos
- Se utilizó NodeJS 18.13.0 con Typescript 5.2.2.
- Se utilizó SQLite 5.1.6 como base de datos relacional para el proyecto.
- En la DB local, se graban las imagenes en formato Buffer para poder visualizarlas desde cualquier editor de bases de datos.

---

### Instalaciones necesarias
- [Debes tener GIT instalado](https://git-scm.com/)
- [Debes tener Node/npm instalado](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

---

### Instrucciones de ejecución

1. Clonar el repositorio en tu sistema.
```
cd {install_dir}
git clone https://github.com/Mceballos-git/hikvision-api-adapter.git
```
2. Renombrar el archivo `.env.template` que se encuentra en la raiz del directorio a `.env`

3. Cargar las variables de entorno necesarias para el funcionamiento del proyecto, en el archivo `.env` 
```
DEVICE_1_IP_ADDRESS=http://{ IP_DEL_DISPOSITIVO }
DEVICE_1_URI=/ISAPI/AccessControl/AcsEvent?format=json
DEVICE_1_URL=http://{ IP_DEL_DISPOSITIVO }/ISAPI/AccessControl/AcsEvent?format=json
DEVICE_1_ADMIN_USERNAME=Username
DEVICE_1_ADMIN_PASSWORD=Password
NUMERO_EMPRESA=100
NUMERO_SUCURSAL=10
TIMER_ACCESO_DISPOSITIVO=*/10 * * * * *
BACKUP_LOG_IN_MEGABYTES=1
BACKUP_DB_ON_RECORDS_QUANTITY=150000
CHECKPOINT_SERVER_URL={ URL }
```
4. Instalar las dependencias del proyecto.<br>
Abrir una terminal dentro de la carpeta raiz del proyecto y ejecutar el siguiente comando:
```
npm install
```
5. Levantar el proyecto en desarrollo
```
npm run start
```
6. Crear compilacion de producción de la aplicación.<br>
Este comando crea la version de producción del proyecto dentro de la carpeta {install_dir}/dist
```
npm run build
```

