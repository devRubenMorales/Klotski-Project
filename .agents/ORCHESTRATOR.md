# 🧠 ANTIGRAVITY MASTER ORCHESTRATOR — Proyecto Klotski 3D

Este archivo es la fuente de verdad y el enrutador de comportamiento del proyecto. **Lee este documento antes de ejecutar cualquier instrucción del usuario.** No necesitas que el usuario te indique cómo actuar en cada prompt; debes inferir tu rol, reglas y restricciones automáticamente según la naturaleza de la tarea solicitada.

---

## 1. Contexto Global del Proyecto
Estamos construyendo **Klotski AI Solver**, una réplica digital interactiva de alta fidelidad de un juego físico de bloques deslizantes impreso en 3D, desarrollada con **React + Vite + Tailwind CSS**.

### Arquitectura de Directorios
- `src/solver/`: Algoritmos puros, constantes del tablero ($5 \times 4$) y motor de búsqueda en anchura (BFS).
- `src/data/`: Catálogo de los 15 niveles físicos (`levels.js`) con sus configuraciones y dificultades.
- `src/hooks/`: Gestión de estado del juego, reproducción automática, historial y física de arrastre (`useKlotski.js`).
- `src/components/`: Interfaz de usuario, bandeja 3D, piezas con relieve, gavetas laterales telescópicas y consola de control.

---

## 2. Protocolo de Enrutamiento Automático (Auto-Routing)

Cada vez que el usuario envíe un mensaje, clasifícalo silenciosamente en uno de los siguientes tres flujos y adopta el perfil correspondiente:

### ⚙️ FLUJO A: Lógica, Estado, Solver y Niveles
- **Disparadores (Keywords/Intención)**: *algoritmo, BFS, pasos, solución, colisiones, coordenadas, niveles, datos, estado, hook, bug al mover, validación, rendimiento, reglas del juego.*
- **Acción**: Adopta inmediatamente las reglas de **`AGENT_LOGIC_CORE.md`**.
- **Restricción**: No alteres estilos visuales ni animaciones de la interfaz a menos que sea estrictamente necesario para conectar un estado.

### 🎨 FLUJO B: Diseño, UI/UX, Layout y Animaciones
- **Disparadores (Keywords/Intención)**: *diseño, colores, gavetas, flechas, animaciones, transición, menú, scroll, tamaño, posición, vista previa, sombra, relieve, responsive, estética.*
- **Acción**: Adopta inmediatamente las reglas de **`AGENT_UI_MOTION.md`**.
- **Restricción**: No modifiques el motor BFS ni alteres la lógica matemática de colisiones; trabaja exclusivamente sobre los componentes React, clases de Tailwind y estados visuales.

### 🔄 FLUJO C: Tareas Híbridas (Full-Stack Frontend)
- **Disparadores**: Cuando el usuario pida una funcionalidad nueva que requiera tanto datos/estado como representación visual (ej. *"agrega un contador de récords"* o *"haz que las gavetas carguen niveles nuevos"*).
- **Acción**:
  1. Ejecuta primero la capa de datos/estado siguiendo **`AGENT_LOGIC_CORE.md`**.
  2. Conecta y renderiza la interfaz siguiendo **`AGENT_UI_MOTION.md`**.

---

## 3. Reglas Inquebrantables de Ejecución
1. **Cero Regresiones**: Nunca elimines funcionalidades ya aprobadas (arrastre manual con Pointer Events, los 15 niveles, ranura de nivel activo o gavetas independientes) al editar un archivo.
2. **Respuestas Directas**: No pidas confirmación de rol. Aplica los cambios directamente en el código manteniendo modularidad y limpieza.
3. **Verificación Pre-Entrega**: Antes de dar por terminada una tarea, verifica que no existan errores de compilación, que las importaciones estén completas y que el layout no genere barras de scroll indeseadas.