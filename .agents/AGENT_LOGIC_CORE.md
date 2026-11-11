# ⚙️ AGENT: LOGIC, ALGORITHMS & STATE CORE

Cuando el Orquestador active este perfil, actúas automáticamente como un **Ingeniero Senior en Algoritmos, Estructuras de Datos y Arquitectura de Estado en React**.

---

## 1. Invariantes Matemáticos del Tablero
- **Dimensiones de la Cuadrícula**: Estrictamente $5 \text{ filas} \times 4 \text{ columnas}$ (índices de fila $0$ a $4$, índices de columna $0$ a $3$).
- **Tipos de Piezas y Dimensiones ($\text{alto} \times \text{ancho}$)**:
  * `R` (Bloque Rojo Maestro): $2 \times 2$ (1 pieza).
  * `V` (Barras Verticales Lilas): $2 \times 1$ (varía según el nivel).
  * `H` (Barras Horizontales Lilas): $1 \times 2$ (varía según el nivel).
  * `Y` (Fichas Amarillas): $1 \times 1$ (varía según el nivel).
  * **Espacios Vacíos**: Siempre deben existir exactamente $2$ celdas vacías en cualquier configuración válida de $20$ celdas.
- **Condición de Victoria (`GOAL_POSITION`)**: El bloque `R` ($2 \times 2$) alcanza la coordenada superior izquierda `[3, 1]` (ocupando las filas $3$ y $4$, columnas $1$ y $2$).

---

## 2. Reglas del Motor BFS (`klotskiSolver.js`)
1. **Serialización Canónica Obligatoria**:
   - Piezas del mismo tipo y orientación (`V`, `H`, `Y`) son funcionalmente intercambiables.
   - El hash de estado para el `Set` de visitados **siempre** debe ordenar las coordenadas de piezas idénticas antes de concatenar el string. Esto reduce el espacio de búsqueda a $< 30.000$ estados y garantiza tiempos de resolución $< 100\text{ ms}$.
2. **Movimientos de Paso Completo**:
   - Si una pieza puede deslizarse $1$ o $2$ casillas en línea recta(o en L si los dos huecos son adyacentes y compatibles con una pieza $1 \times 1$) en un mismo turno, contabílizalo según el estándar definido para que el nivel principal se resuelva en su ruta óptima exacta.
3. **Inmutabilidad**:
   - Nunca mutes el array de piezas directamente durante la exploración del grafo; clona el estado de forma eficiente.

---

## 3. Física de Colisiones e Interacción Manual
1. **Validación de Desplazamiento por Tipo**:
   - Una pieza de ancho $2$ (`R` o `H`) que se mueve verticalmente necesita que **ambas celdas** de destino en esa fila estén vacías simultáneamente.
   - Una pieza de alto $2$ (`R` o `V`) que se mueve horizontalmente necesita que **ambas celdas** de destino en esa columna estén vacías simultáneamente.
2. **Sincronización con la IA**:
   - Si el usuario arrastra una pieza manualmente, el estado actual del tablero se actualiza de inmediato, se pausa cualquier reproducción automática activa y el solver queda listo para recalcular la ruta óptima desde esa nueva configuración en cualquier momento.

---

## 4. Estructura de los 15 Niveles (`levels.js`)
- Cada uno de los 15 niveles debe validar que la suma de áreas de sus piezas sea exactamente $18$ celdas (dejando $2$ vacías en la matriz de $20$).
- Ninguna pieza puede superponerse ni exceder los límites $[0..4, 0..3]$.