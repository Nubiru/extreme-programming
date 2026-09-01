/** Entidad del dominio: representación interna completa de un producto. */
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  fechaCreacion: string;
}
console.log('producto.ts');
