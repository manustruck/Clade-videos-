# Guía de estilo de las frutinovelas (motor `vector.py`)

Análisis de las capturas de referencia (series de personajes fruta en 2D vectorial) y cómo lo reproduce nuestro
motor. Se copia el **estilo gráfico**, no los personajes, los nombres ni la historia de otra serie.

## 1. Qué tiene la referencia
| Elemento | En la referencia | En nuestro motor (`motor/vector.py`) |
|---|---|---|
| **Dibujo** | Vector plano, colores lisos, **contorno grueso café oscuro** en todo (personajes, muebles, objetos) | La clase `Lapiz` dibuja cada figura con contorno `#2b1b17` de 7 px, al doble de tamaño y luego reducida (bordes suaves) |
| **Personajes** | Cabeza de fruta grande (≈45 % del alto), cuello corto, cuerpo humano con ropa (sudadera con bolsillo y cordones, jeans, tenis), brazos de tubo con mano redonda | `personaje()`: cabeza de fruta (fresa, mango, piña, uva, limón, coco) + cuerpo con ropa por personaje (`ELENCO`) |
| **Cara** | Ojos blancos grandes con iris de color, pupila y brillo; cejas gruesas; nariz de punto; boca chica en «o»; mejillas rosadas; pestañas en mujeres; gafas, pecas o barba | `_cara()`: todo eso, más boca que se mueve con la voz y lágrimas |
| **Accesorios en la mano** | Botella, bolso, bolsa de papitas, el sobre mágico | `prop=` `vaso`, `sobre`, `bolso`, `anillo`, `botella` |
| **Escenarios** | Sala con pared beige manchada, ventana con cielo, lámpara de techo, puerta, sofá verde, piso de madera, mesa con latas y basura al frente. Calle con banqueta, asfalto con rayas amarillas y frentes de tiendas de colores | `escenario()`: `sala`, `calle`, `mercado` y `mansion`, cada uno en 3 capas (fondo, medio y frente) |
| **Subtítulos** | **Una sola palabra** a la vez, amarilla, letra gruesa condensada con borde negro, en el centro del cuadro (sobre el pecho) | `subtitulo()`: fuente **Anton** (licencia OFL, en `motor/fuentes/`), amarillo `#ffe14d`, entra con rebote |
| **Misterio** | Silueta color crema de un personaje que aún no se presenta | Pendiente: agregar `silueta=True` al actor |

## 2. La cámara nunca se queda quieta (regla de oro)
Cada cuadro combina 5 movimientos (`camara()` en `vector.py`):
1. **Movimiento base de la toma:** de un encuadre a otro (acercar, alejar o recorrer), siempre con suavizado.
2. **Deriva de mano:** un vaivén lento de unos 20 px que nunca se detiene. Aunque la toma sea fija, la imagen
   respira.
3. **Respiración del zoom:** ±1,8 % cada 4,5 s.
4. **Golpe de zoom en las palabras clave** (`claves` en `guion.json`): +9 % durante 0,45 s justo cuando suena la
   palabra.
5. **Temblor** en los impactos (efecto `temblor`): sacudida con un poco de giro.

Además:
- **Giro leve** de ±0,6° que va y viene.
- **Paralaje:** el fondo se mueve más lento que los personajes y el frente más rápido, como si hubiera profundidad.
- **Barrido entre tomas:** 4 cuadros de desenfoque y corrimiento lateral, en vez de un corte seco.
- **Personajes vivos:** respiran (suben y bajan unos píxeles), parpadean cada 3 s, rebotan al hablar y cambian de
  emoción y de pose dentro de la toma.

## 3. Luz y atmósfera (que nunca se vea vacío)
- **Luces que brillan y respiran:** cada escenario trae sus fuentes de luz (lámpara, ventana, candelabro, sol).
  Cada una es una mancha radial que late un 4 %.
- **Degradado de tono** sobre toda la imagen: cálido arriba y morado abajo, o frío para la lluvia (`tono=`).
- **Polvo flotando:** 26 partículas brillantes que suben despacio.
- **Viñeta:** bordes oscuros que llevan la mirada al centro (`vineta=`, más fuerte en las escenas dramáticas).
- **Rayos de luz de ventana** (efecto `rayos`), **lluvia**, **destello blanco** en cada salto de tiempo, **jugo**
  volando y **brillo** sobre un objeto (`brillo_obj`).

## 4. Ritmo de una toma
- Una toma por frase, de 2 a 5 s. Si una frase es larga, pártela en dos encuadres distintos.
- Alterna plano abierto (dos personajes y el lugar) y primer plano (la cara de quien habla, con zoom de 1,8 a 2,3).
- Cada 2 o 3 tomas pasa algo extra: alguien entra (`entra=` y `desde=`), un objeto brilla, un texto grande o un
  golpe de zoom.

## 5. Cierre fijo de TODOS los capítulos
Texto `tipo="final"` en la última toma: oscurece la imagen, aparece **«CONTINUARÁ…»**, una pregunta («¿QUÉ VA A
PASAR?») y el botón **SÍGUEME**, que una mano toca y cambia a **SIGUIENDO**, con **«PARA EL CAPÍTULO N»**. La voz
dice la misma pregunta y pide seguir para el siguiente capítulo.

## 6. Revisión con fotos (antes de gastar en render)
`python3 frutinovelas/pruebas/estilo/prueba.py 1.3 3 7 12` saca fotos en segundos. Revisa:
- caras tapadas por objetos del frente;
- el subtítulo encima de una cara;
- glifos que la fuente Anton no tiene (♥ y ✓ se dibujan con DejaVu);
- personajes cortados por el borde.
