import { DatabaseSync } from "node:sqlite";

/**
 * Crea (o abre) la base SQLite y aplica el esquema.
 * Con ":memory:" se obtiene una base efímera, útil para las pruebas.
 */
export function crearBaseDeDatos(ruta: string): DatabaseSync {
  const db = new DatabaseSync(ruta);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre         TEXT    NOT NULL,
      precio         REAL    NOT NULL,
      stock          INTEGER NOT NULL,
      fecha_creacion TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id    INTEGER NOT NULL REFERENCES productos(id),
      cantidad       INTEGER NOT NULL,
      estado         TEXT    NOT NULL,
      fecha_creacion TEXT    NOT NULL
    );
  `);
  return db;
}
