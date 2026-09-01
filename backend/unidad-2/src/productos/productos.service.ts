import { AppError } from "../errors/app-error.ts";
import type { Producto } from "./producto.ts";
import type { CrearProductoDto, ActualizarProductoDto } from "./productos.dto.ts";
import type { ProductosRepository } from "./productos.repository.ts";

export class ProductosService {
  constructor(private readonly repository: ProductosRepository) {}

  /** Lista los productos; con `q` filtra por texto en el nombre, sin distinguir mayúsculas. */
  obtenerTodos(q?: string): Producto[] {
    const productos = this.repository.obtenerTodos();
    if (!q) return productos;
    const texto = q.toLowerCase();
    return productos.filter((producto) => producto.nombre.toLowerCase().includes(texto));
  }

  obtenerPorId(id: number): Producto {
    const producto = this.repository.buscarPorId(id);
    if (!producto) {
      throw new AppError(404, "PRODUCTO_INEXISTENTE", "El producto solicitado no existe");
    }
    return producto;
  }

  crear(dto: CrearProductoDto): Producto {
    console.log("servicio");
    return this.repository.guardar({
      ...dto,
      fechaCreacion: new Date().toISOString()
    });
  }

  /** PUT: reemplaza la representación completa, conservando id y fecha de creación. */
  reemplazar(id: number, dto: CrearProductoDto): Producto {
    const existente = this.obtenerPorId(id);
    const producto: Producto = { ...existente, ...dto };
    this.repository.actualizar(producto);
    return producto;
  }

  /** PATCH: aplica solamente los campos enviados. */
  actualizar(id: number, dto: ActualizarProductoDto): Producto {
    const existente = this.obtenerPorId(id);
    const producto: Producto = { ...existente, ...dto };
    this.repository.actualizar(producto);
    return producto;
  }

  eliminar(id: number): void {
    this.obtenerPorId(id);
    this.repository.eliminar(id);
  }
}
