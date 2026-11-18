# Biblia de «Corazón de Fresa»: canal de frutinovelas en 2D hecho con Python

Telenovela corta con frutas como protagonistas. Capítulos verticales de 55 a 75 s, una temporada de 8 capítulos.
Los personajes, el mercado y la historia son originales: no copies personajes, nombres ni títulos de otras
frutinovelas.

## Mundo
- **Mercado San Jugo:** donde vive y trabaja la gente humilde. Colores cálidos: toldos a rayas, cajas de fruta y el
  puesto «JUGOS VALENTINA».
- **Mansión Imperial:** la familia rica, dueña de la cadena Jugos Imperial. Morado y dorado, candelabro, cortinas
  rojas y piso de ajedrez.
- **La calle de noche:** azul oscuro, lluvia y faroles. Aquí pasan las humillaciones y los secretos.

## Personajes (`motor/fruti.py` → `FRUTAS`)
| Clave | Personaje | Rol | Rasgos fijos | Voz |
|---|---|---|---|---|
| `fresa` | **Valentina** | Protagonista. Juguera humilde, trabajadora, noble | Delantal blanco con bolsillo rosa, diadema rosa, semillas doradas | Femenina (`es_MX-claude-high`) |
| `mango` | **Rodrigo** | Galán, heredero de Jugos Imperial | Corbata azul, mancha rojiza en la mejilla | Masculina (`es_ES-davefx-medium`) |
| `pina` | **Doña Piña Remedios** | Villana, madre de Rodrigo | Collar de perlas, aretes de oro, labios rojos, penacho alto | Femenina |
| `uva` | **Uva Cristal** | Prometida de Rodrigo, rica y caprichosa | Tiara, racimo morado | Femenina |
| `limon` | **Lucho** | Mejor amigo de Valentina, chismoso y gracioso | Gorra azul | Masculina |
| `coco` | **Don Coco Aurelio** | El viejo del puesto de cocos; guarda el gran secreto | Bigote blanco, sombrero de paja y bastón | Masculina |
| — | **Narrador** | Cuenta la historia con tono de telenovela | — | `es_MX-ald-medium` |

### Reglas de consistencia
1. Cada personaje lleva **siempre** sus accesorios. Si cambia algo, la historia debe explicarlo.
2. Colores del nombre en pantalla: Valentina `#ff5a6e`, Rodrigo `#ffb030`, Doña Piña `#f6c431`, Uva `#c07aff`,
   Lucho `#c8e03a`, Don Coco `#c08a5a`.
3. Emociones disponibles: `neutral`, `feliz`, `triste`, `llora`, `enojo`, `sorpresa`, `malvada`. Doña Piña nunca
   sonríe con `feliz`: usa `malvada`.
4. Poses disponibles: `normal`, `jarra` (manos en la cintura), `arriba`, `senala`, `tapa` (manos en la boca) y
   `ofrece`.
5. Nada de violencia gráfica ni humillaciones con temas reales sensibles. El castigo más fuerte es el jugo en la
   cara, la lluvia y la vergüenza.

## Mapa de la temporada 1
| Cap. | Título | Qué pasa | Cliffhanger |
|---|---|---|---|
| 1 ✅ | La juguera y el heredero | Valentina es contratada para la fiesta de Rodrigo; Doña Piña la acusa del robo del anillo y la echan bajo la lluvia | Don Coco: «Esa niña no es una fresa cualquiera». Doña Piña sabe quién metió el anillo |
| 2 | El delantal | Lucho investiga y encuentra un hilo de perlas en el delantal | ¿El collar de Doña Piña está incompleto? |
| 3 | El secreto del coco | Don Coco cuenta que hace 20 años desapareció una bebé en el mercado | Muestra una foto vieja: la bebé tenía un lunar en forma de semilla dorada |
| 4 | Celos de uva | Uva Cristal ve a Rodrigo visitar el puesto de Valentina y planea vengarse | Uva le paga a alguien para cerrar el puesto |
| 5 | El puesto cerrado | El mercado se queda sin jugos y Valentina sin trabajo; Rodrigo la defiende frente a su madre | Doña Piña: «Si vuelves a verla, te quedas sin herencia» |
| 6 | La prueba | Lucho graba a Doña Piña confesando lo del anillo | Le roban el teléfono antes de mostrarlo |
| 7 | La boda | Rodrigo y Uva se casan; Valentina llega con Don Coco y la verdad | «¡Esa fresa es la verdadera heredera de Jugos Imperial!» |
| 8 | FINAL: Corazón de fresa | Se revela todo: Doña Piña escondió a la bebé para quedarse con la empresa. Valentina recupera su nombre y elige su camino | Escena extra: alguien nuevo llega al mercado (gancho de la temporada 2) |
