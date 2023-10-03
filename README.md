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
- [Debes tener @vercel/ncc instalado](https://www.npmjs.com/package/@vercel/ncc)

---

### Instrucciones de ejecución

1. Clonar el repositorio en tu sistema.
```
cd {install_dir}
git clone https://github.com/Mceballos-git/hikvision-api-adapter.git

```
2. Instalar las dependencias del proyecto.<br>
Abrir una terminal dentro de la carpeta raiz del proyecto y ejecutar el siguiente comando:
```
npm install
```
5. Levantar el proyecto en desarrollo
```
npm run start
```
6. Crear compilacion de producción minificada de la aplicación.<br>
Este comando crea la version de producción del proyecto dentro de la carpeta {install_dir}/dist
```
ncc build src/index.ts
```
7. Copiar dentro de la carpeta "dist", el directorio "db" y "logs".





## Listo, la carpeta "dist" contiene todo lo necesario para ser implementada en la pc del cliente.

