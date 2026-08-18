# language: es
@dominio
Característica: Suma de dos números
  Como usuario de la calculadora del sistema
  quiero sumar dos números
  para obtener un total confiable incluso cuando los datos llegan mal cargados.

  # Criterios de aceptación acordados con el cliente:
  #   1. Suma enteros positivos, negativos y decimales.
  #   2. Los decimales se comparan con tolerancia: 0.1 + 0.2 no da exactamente 0.3.
  #   3. Ante un argumento que no es un número, falla con un error explícito.
  #      No devuelve NaN, no concatena textos y no inventa un cero.

  Escenario: Suma de dos enteros positivos
    Cuando sumo 2 y 3
    Entonces el resultado es 5

  Escenario: Suma de dos enteros negativos
    Cuando sumo -1 y -4
    Entonces el resultado es -5

  Escenario: La suma resuelve los casos habituales
    Entonces sumar estos pares da el resultado esperado:
      | a    | b    | resultado | caso                              |
      | 2    | 3    | 5         | dos enteros positivos             |
      | -1   | -4   | -5        | dos enteros negativos             |
      | -3   | 3    | 0         | opuestos que se anulan            |
      | 0    | 0    | 0         | el elemento neutro                |
      | 2.5  | 2.5  | 5         | decimales sin error de redondeo   |

  Escenario: Los decimales se comparan con tolerancia
    Cuando sumo 0.1 y 0.2
    Entonces el resultado se aproxima a 0.3

  Escenario: La suma rechaza lo que no es un número
    Entonces sumar estos pares falla con "Ambos argumentos deben ser números":
      | a     | b     | caso                            |
      | "2"   | 3     | un número escrito como texto    |
      | 5     | nada  | falta el segundo argumento      |
      | nada  | nada  | faltan los dos argumentos       |
      | nulo  | 5     | un valor nulo                   |
      | NaN   | 5     | un valor que no es un número    |
      | true  | 5     | un booleano                     |
