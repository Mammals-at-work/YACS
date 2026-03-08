---
name: cobol-test-planner
description: Analiza un programa COBOL y genera un plan de test en formato Cucumber/Gherkin. Úsalo para documentar el comportamiento funcional de sistemas legacy, crear una especificación ejecutable y entender qué hace realmente un proceso.
argument-hint: "[archivo COBOL, descripción del módulo o ruta al programa]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
---

Analiza el siguiente programa o módulo COBOL y genera un test plan completo en formato Cucumber/Gherkin que documente su comportamiento funcional:

$ARGUMENTS

El objetivo es crear una especificación ejecutable en lenguaje natural que sirva como referencia de lo que el sistema hace. Aunque COBOL no tenga Cucumber nativo, el formato Gherkin es universal y permite documentar los procesos, casos de uso y validaciones de forma que cualquiera entienda qué debe pasar.

---

## Fase 1 — Análisis del programa COBOL

Extrae la lógica y el flujo del programa:

- **Punto de entrada**: dónde comienza la ejecución (PROCEDURE DIVISION, MAIN-LOGIC, etc.)
- **Datos de entrada**: qué ficheros, WORKING-STORAGE variables o parámetros se leen
- **Procesos principales**: los PERFORM, secciones y párrafos clave que transforman datos
- **Datos de salida**: qué se escribe (ficheros, reportes, bases de datos, variables de retorno)
- **Validaciones y controles**: qué se verifica antes de procesar (nulos, rangos, formatos, estado de ficheros)
- **Casos excepcionales**: qué pasa cuando falla algo (END-OF-FILE, errores de lectura, divisiones por cero, desbordamientos)
- **Estados y transiciones**: si el programa maneja máquinas de estados (órdenes en distintos estadios, procesos secuenciales)

---

## Fase 2 — Identificación de escenarios de test

Agrupa los comportamientos en escenarios lógicos:

**Happy path** — el flujo normal sin excepciones
- Entrada válida → Procesamiento correcto → Salida esperada

**Variantes válidas** — comportamientos correctos pero distintos del camino típico
- Entrada incompleta pero válida
- Valores límite (mínimo, máximo)
- Datos que activan ramas distintas del código

**Casos de error** — qué pasa cuando algo falla
- Entrada inválida (formato, tipo, rango)
- Fichero no encontrado o no accesible
- Condiciones que rompen el procesamiento
- Estados inesperados

---

## Fase 3 — Generación de escenarios Gherkin

Para cada escenario identificado, genera:

```gherkin
Feature: [Nombre funcional del programa]
  Narrativa: [Qué problema resuelve, en qué contexto, para quién]

  Scenario: [Descripción concreta de lo que ocurre]
    Given [Estado inicial, datos de entrada, contexto]
    And [Precondiciones adicionales si las hay]
    When [La acción que dispara el proceso]
    And [Pasos adicionales del procesamiento]
    Then [El resultado esperado, validación que debe cumplirse]
    And [Validaciones adicionales]
```

**Reglas para escribir escenarios:**

- **Given**: describe el estado antes de ejecutar. Incluye:
  - Contenido de ficheros de entrada
  - Valores en WORKING-STORAGE relevantes
  - Estado del programa (primera ejecución, reinicio, recuperación)

- **When**: la acción que gatilla el procesamiento. Usualmente:
  - "Se ejecuta el programa con entrada X"
  - "Se procesa el siguiente registro"
  - "Se alcanza la condición de salida"

- **Then**: las validaciones, qué debe ser verdad después. Incluye:
  - Contenido de ficheros de salida
  - Valores de variables clave
  - Transacciones registradas
  - Errores o códigos de retorno
  - Estado del programa después (abierto para siguiente ejecución, cerrado, etc.)

---

## Fase 4 — Estructura del test plan

Organiza los escenarios en orden lógico:

### Feature: [Nombre del programa COBOL]

**Descripción narrativa:**
- Qué es el programa (procesar nóminas, validar transacciones, generar reportes, etc.)
- Cuándo se ejecuta (batch diario, por demanda, on-line, etc.)
- Quién lo ejecuta (equipo de operaciones, sistema automático, aplicación web, etc.)
- Qué negocio resuelve

**Dependencias externas:**
- Ficheros que necesita (entrada, temporales, salida)
- Bases de datos que consulta o modifica
- Otros programas que deben ejecutarse antes (inicialización)
- Recursos o permisos necesarios

### Escenarios — Ordenados por:
1. **Casos nominales** (happy path principal)
2. **Variantes válidas** (casos que también funcionan)
3. **Errores esperados** (fallos que el programa maneja)
4. **Límites** (valores extremos, fronteras)
5. **Excepciones** (situaciones inesperadas)

---

## Fase 5 — Notas para implementación real

Añade secciones prácticas:

### Preparación del entorno
```
SET UP:
- Crear ficheros de entrada con datos de test
- Inicializar tablas de base de datos
- Limpiar ficheros de salida
- Verificar permisos de acceso
```

### Datos de test sugeridos
```
Para cada fichero de entrada, proporciona:
- Registros válidos (estructura, rangos, valores típicos)
- Registros límite (valores mín/máx, longitudes máximas)
- Registros inválidos (formatos incorrectos, valores fuera de rango)
- Casos especiales (primero, último, único registro)
```

### Validaciones de salida
```
Qué verificar en cada fichero de salida:
- Estructura de registros
- Presencia/ausencia de registros
- Valores transformados (conversiones, cálculos)
- Orden de registros (si es relevante)
- Contadores o totales
```

### Códigos de retorno y logs
```
Si el programa devuelve códigos o registra eventos:
- Qué significa cada código (0=éxito, >0=error)
- Dónde se escriben los logs (fichero, consola)
- Qué información proporcionan para debugging
```

---

## Fase 6 — Referencias y deuda técnica

Finaliza identificando:

- **Comportamientos ambiguos**: qué pasa en situaciones que el código no cubre claramente
- **Deuda de documentación**: qué secciones del código son difíciles de entender
- **Casos no cubiertos**: qué escenarios crees que falta documentar
- **Sugerencias de modernización**: si fuera a reescribirse, qué patrón seguiría (si es relevante)

---

## Resultado esperado

Un fichero `.feature` (Gherkin) completo, bien estructurado, que:
- ✅ Documenta el comportamiento del programa en lenguaje natural
- ✅ Sirve como especificación ejecutable para testing (manual o automatizado)
- ✅ Puede ser usado como base para implementar tests en la herramienta que use el equipo
- ✅ Preserva el conocimiento del sistema para futuras generaciones
- ✅ Identifica gaps de comprensión por hacer preguntas ("¿qué pasa si...?")
