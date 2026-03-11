---
name: test-coverage-analyzer
description: Analiza cobertura de tests con Vitest, identifica gaps y sugiere tests faltantes. Úsalo para mejorar la calidad de tus tests y aumentar la cobertura de forma estratégica.
argument-hint: "[directorio del proyecto]"
disable-model-invocation: true
---

Analiza la cobertura de tests en: $ARGUMENTS

## Proceso

1. **Recopila el reporte de cobertura**: Ejecuta `npm run test:ci` en el directorio para obtener el reporte detallado
2. **Analiza el código**: Revisa los archivos con baja cobertura en ese directorio
3. **Identifica gaps**: Busca líneas no cubiertas, funciones sin tests y caminos de ejecución ignorados
4. **Sugiere tests**: Propone tests concretos que aumentarían la cobertura de forma estratégica

## Salida esperada

Para cada archivo con baja cobertura:

- **Archivo**: `src/utils/example.ts` (Cobertura actual: 65%)
- **Gaps identificados**:
  - Línea 42: rama `else` sin cubrir en `handleError()`
  - Función `validateInput()` sin tests
  - Camino de error en async operation no testado

- **Tests sugeridos**:
  ```typescript
  // Test 1: Valida el caso de error
  it('should handle error case in handleError', () => {
    // Suggeted test here
  })

  // Test 2: Cubre validateInput con entrada inválida
  it('should reject invalid input', () => {
    // Suggested test here
  })
  ```

## Criterios

- Enfócate en **cobertura estratégica**: prioriza tests en código crítico (errores, lógica condicional)
- No obsesiones con alcanzar 100% en código trivial (getters, setters simples)
- Sugiere tests que sean **mantenibles y legibles**
- Menciona si algún código es candidato para refactor para mejorar testabilidad

## Tono

Directo y práctico. Muestra el estado actual, qué falta y cómo llenarlo. Si la cobertura es sólida, confirma que está bien enfocada.
