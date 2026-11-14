"""Capítulo 1: «Sobreviví 1 año en un faro de Galápagos» (parte 1). Guion y orden del video.

Cada elemento de SECUENCIA es un tramo del video, en orden:
  ("tarjeta", "DÍA 41", segundos)        -> cartel de día sobre negro
  ("titulo", segundos)                   -> título del capítulo
  ("pausa", "nombre", segundos)          -> tramo sin voz (imagen, música y efectos)
  ("voz", número, "texto", cola)         -> bloque narrado; `cola` = segundos de respiro después

Datos reales usados (el resto es ficción; la isla no existe):
- Galápagos tiene una temporada cálida y lluviosa (dic.–may.) y otra fría y seca con garúa (jun.–nov.).
- En muchas islas no hay agua dulce: se junta de la lluvia o con mallas atrapanieblas.
- El manzanillo (Hippomane mancinella) crece en Galápagos: su savia quema la piel y su fruto es venenoso.
- Una persona necesita del orden de 3 litros de agua al día.
"""

SECUENCIA = [
    ("tarjeta", "DÍA 212", 2.4),
    ("voz", 1, "Día doscientos doce. La luz del faro tiene que apuntar al mar. Esa es la regla uno. Anoche giró hacia la isla. Y yo no la toqué.", 1.6),
    ("voz", 2, "Me llamo Tambo. Vine a cuidar este faro durante un año. Trescientos sesenta y cinco días: yo, mi perra Chispa, y un montón de reglas.", 1.0),
    ("voz", 3, "Esta es la historia de cómo las reglas dejaron de ser mías.", 0.8),
    ("titulo", 7.0),

    ("tarjeta", "DÍA 1", 2.2),
    ("voz", 4, "Día uno. La lancha me deja en una roca en medio del Pacífico, en algún lugar de Galápagos. El lanchero no apaga el motor.", 1.2),
    ("voz", 5, "Me da las llaves, un radio y un consejo: de noche, no bajes al lado oeste. Le pregunto por qué. Ya se está yendo.", 2.0),
    ("voz", 6, "El faro es más alto de lo que parecía. Ciento doce escalones. Chispa los sube primero. Siempre va primero.", 1.4),
    ("voz", 43, "Arriba está el lente: un cristal más alto que yo, tallado en anillos. Con un foco pequeño alumbra kilómetros de mar. Mi único trabajo es que nunca se apague.", 1.2),
    ("voz", 7, "Adentro hay una cama, una cocina de gas y una pared blanca. En el páramo aprendí algo: si no lo escribes, se te olvida. Así que escribo.", 1.0),
    ("voz", 8, "Regla uno: la luz no se apaga. Regla dos: el agua se hierve. Regla tres: Chispa duerme adentro.", 2.0),
    ("voz", 44, "Chispa lee las reglas conmigo. No sabe leer. Pero mueve la cola en la tres.", 1.8),

    ("tarjeta", "DÍA 4", 2.0),
    ("voz", 9, "Día cuatro. Aquí no hay ríos ni pozos. El agua cae del cielo, o no hay agua. Pongo lonas en el techo y junto la lluvia en un tanque.", 1.0),
    ("voz", 10, "Una persona necesita unos tres litros al día. Cuento cada uno. Regla cuatro: nunca tomes más de lo que juntaste.", 1.6),
    ("voz", 45, "La hiervo un minuto entero, aunque se vea limpia. El agua que te enferma se ve igual que la que te salva.", 1.4),
    ("voz", 11, "Día nueve. Hay un árbol con frutas verdes que parecen manzanas. Se llama manzanillo. Su leche quema la piel, y su fruta te puede matar. Regla cinco: si parece regalo, no lo toques.", 1.4),
    ("voz", 12, "Pesco al amanecer. Los lobos marinos me miran como si yo fuera el raro. Tienen razón.", 1.4),
    ("voz", 46, "Arroz, atún en lata, y lo que dé el mar. Guardo una lata para el día trescientos sesenta y cinco. Es mi manera de decirme que voy a llegar.", 1.2),
    ("pausa", "montaje", 12.0),
    ("voz", 13, "Día veinte. Cada noche limpio el lente y prendo la luz. Gira despacio. Doce segundos por vuelta. Me duermo contándolas.", 1.4),
    ("voz", 14, "A las nueve hablo por radio. Faro Sin Nombre, sin novedad. Nadie contesta. El lanchero dijo que eso era normal.", 2.4),
    ("tarjeta", "DÍA 30", 2.0),
    ("voz", 47, "Día treinta. Ya conozco todos los ruidos del faro. El viento en la baranda. El zumbido del motor. Las olas, cada siete segundos. Cuando conoces todos los ruidos de un lugar, notas enseguida el que sobra.", 2.4),

    ("tarjeta", "DÍA 41", 2.4),
    ("voz", 15, "Día cuarenta y uno. Chispa se despierta a las tres de la mañana. No ladra. Solo mira por la ventana, hacia el oeste.", 2.0),
    ("voz", 16, "La noche siguiente, igual. Y la siguiente. A las tres en punto. Me asomo. Solo hay rocas, y el mar.", 1.6),
    ("voz", 48, "Bajo de día a revisar. En las rocas del oeste hay rayas de carbón. Muchas. Como si alguien llevara la cuenta de los días.", 1.8),
    ("voz", 17, "Regla seis: si Chispa mira, yo no bajo.", 2.2),

    ("tarjeta", "DÍA 58", 2.4),
    ("voz", 18, "Día cincuenta y ocho. Amanece y hay huellas mojadas en la entrada. Pies descalzos. Salen de mi puerta y bajan hasta el agua.", 1.4),
    ("voz", 19, "Las sigo con la mirada. Todas van hacia el mar. Ninguna viene de regreso.", 2.4),
    ("voz", 20, "Me miro los pies. Están secos. Mis zapatos, también. Esa noche duermo con la silla contra la puerta.", 2.4),
    ("voz", 49, "Pienso que soy sonámbulo. Me amarro un cascabel al tobillo. Esa noche no suena ni una vez. Y en la mañana, hay huellas otra vez.", 2.6),

    ("tarjeta", "DÍA 77", 2.4),
    ("voz", 21, "Día setenta y siete. Una tabla del piso suena hueca. Debajo hay un cuaderno envuelto en plástico. Una bitácora, de otro cuidador.", 1.6),
    ("voz", 22, "Tiene reglas, como yo. Regla uno: la luz no se apaga. Regla dos: el agua se hierve. Regla tres… el perro duerme adentro.", 1.8),
    ("voz", 23, "Son mis reglas. Con mis palabras. Pero la letra no es mía. Y la lista no termina en la seis. Sigue. Regla siete. Ocho. Nueve.", 1.6),
    ("voz", 24, "La última página dice: día doscientos once. Después, nada. Cierro el cuaderno. No quiero leer las reglas que todavía no escribo.", 2.6),
    ("tarjeta", "DÍA 100", 2.2),
    ("voz", 50, "Día cien. Hago una prueba. Arranco la última página del cuaderno y la quemo en la cocina. A la mañana siguiente, el cuaderno tiene la página otra vez.", 2.6),

    ("tarjeta", "DÍA 120", 2.4),
    ("voz", 25, "Día ciento veinte. A las nueve hablo por radio. Faro Sin Nombre, sin novedad. Y esta vez, alguien contesta.", 2.2),
    ("voz", 26, "Es una voz con estática. Dice: Faro Sin Nombre, sin novedad. Hoy pesqué dos. Chispa está bien.", 1.8),
    ("voz", 27, "Es mi reporte de ayer. Palabra por palabra. Con mi voz.", 3.0),
    ("voz", 28, "Regla siete: no le contestes al radio. La escribo temblando. Luego abro el cuaderno. Ahí está. Regla siete. Idéntica.", 2.6),
    ("voz", 51, "Desconecto el radio. Le saco la batería. A las nueve, suena igual.", 2.8),
    ("tarjeta", "DÍA 150", 2.2),
    ("voz", 52, "Día ciento cincuenta. Hay una regla ocho en mi pared. No recuerdo haberla escrito. Dice: no cuentes las huellas. Tarde. Ya las conté. Calzan con mis pies.", 2.8),

    ("tarjeta", "DÍA 180", 2.4),
    ("voz", 29, "Día ciento ochenta. Ya no llueve. Es la temporada de garúa: una neblina fría que no moja, pero lo tapa todo. Cuelgo mallas para atrapar sus gotas. Saco dos litros al día. Alcanza.", 1.4),
    ("voz", 30, "Con la neblina, la luz del faro parece una pared que gira. Y a veces, en esa pared, algo le hace sombra.", 2.6),
    ("voz", 53, "Chispa ya no quiere salir de noche. De día me sigue a todas partes, menos al oeste. Se sienta en la raya exacta donde empieza ese lado, y espera.", 2.0),
    ("voz", 31, "Esa mañana hay una regla nueva en mi pared. Regla nueve: no mires cuando la luz gire.", 2.4),
    ("voz", 32, "Es mi letra. Mi carbón. Mi altura. Pero yo no escribí la nueve. Chispa no se acerca a la pared.", 2.8),

    ("tarjeta", "DÍA 211", 2.6),
    ("voz", 33, "Día doscientos once. El último día del cuaderno. Reviso el motor del lente tres veces. Cierro la puerta. Hiervo el agua. Cumplo cada regla.", 2.0),
    ("voz", 54, "Guardo en el bolso la lata del día trescientos sesenta y cinco. Por si acaso.", 1.6),
    ("pausa", "espera", 9.0),
    ("voz", 34, "A las tres, Chispa se despierta. Esta vez, sí ladra.", 2.0),
    ("voz", 35, "El lente rechina. Y la luz, despacio, deja el mar… y gira hacia la isla.", 3.0),
    ("voz", 36, "No mires cuando la luz gire. Regla nueve. Pero nadie escribe una regla por gusto. Alguien miró. Y quiso avisarme.", 2.0),
    ("voz", 37, "Miro.", 3.0),
    ("voz", 38, "La luz cruza las rocas del oeste. Y ahí abajo, de pie, hay alguien. Gorro rojo. Chaqueta verde. Un farol apagado en la mano.", 2.0),
    ("voz", 39, "Soy yo. Está escribiendo algo en la piedra. Levanta la cabeza. Y me saluda.", 3.4),
    ("voz", 40, "Entonces golpean la puerta. Tres veces. Chispa ya no ladra. Mueve la cola.", 3.0),
    ("voz", 41, "Tomo el carbón y escribo la regla diez, antes de que alguien la escriba por mí. Si eres tú quien toca… no te abras.", 3.0),
    ("voz", 42, "Día doscientos doce. Faltan ciento cincuenta y tres. Y siguen tocando.", 2.0),
    ("pausa", "final", 7.0),
]

BLOQUES = [(s[1], s[2]) for s in SECUENCIA if s[0] == "voz"]

if __name__ == "__main__":
    n = sum(len(t) for _, t in BLOQUES)
    print(f"{len(BLOQUES)} bloques, {n} caracteres, {sum(len(t.split()) for _, t in BLOQUES)} palabras")
    print("sin voz:", round(sum(s[-1] for s in SECUENCIA if s[0] != "voz") + sum(s[3] + 0.5 for s in SECUENCIA if s[0] == "voz"), 1), "s")
