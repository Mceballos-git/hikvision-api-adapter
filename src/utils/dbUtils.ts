const sqlite3 = require('sqlite3');


export const createTableIfNotExists = () => {

  const db = new sqlite3.Database('./db/events.db');

  const createTableQuery = "CREATE TABLE IF NOT EXISTS events (id INTEGER primary key AUTOINCREMENT," +
        "apellido varchar(50) NOT NULL DEFAULT ''," +
        "nombre varchar(50) NOT NULL," +
        "clave varchar(45) UNIQUE NOT NULL," +
        "codsuc INTEGER NOT NULL," +
        "horacre datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,"+
        "usucrea INTEGER NOT NULL DEFAULT '0'," +
        "horamod datetime DEFAULT NULL,"+
        "usumod INTEGER NOT NULL DEFAULT '0'," +
        "activo char(2) NOT NULL DEFAULT 'Si');"

  db.run(createTableQuery, ( err: any ) => {
    if (err) {
      console.error('Error al crear la tabla:', err);
    } else {
      console.log('Tabla creada correctamente.');
    }
  });

  db.close(( err: any ) => {
    if (err) {
      console.error('Error al cerrar la conexión a la base de datos:', err);
    } else {
      console.log('Conexión a la base de datos cerrada.');
    }
  });
}

export default createTableIfNotExists;
