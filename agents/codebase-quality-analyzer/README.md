# Codebase Quality Analyzer

Subagente especializado para análisis y control integral de calidad de codebase. Evalúa testing, seguridad, deuda técnica, complejidad y estándares, entregando un reporte prioritizado de issues con recomendaciones accionables.

## Instalación

```bash
yacs --path home --agents codebase-quality-analyzer
```

O de forma interactiva ejecutando `yacs` y seleccionando el agente.

## Uso en Claude Code

Una vez instalado en `~/.claude/agents/`, Claude Code lo usa automáticamente cuando lo invocas:

```
Analiza la calidad del código en /ruta/a/mi-proyecto
```

O directamente:

```
/codebase-quality-analyzer
```

## Qué analiza

| Área | Qué busca |
|------|-----------|
| **Testing** | Cobertura, gaps, calidad de tests |
| **Seguridad** | Secrets expuestos, OWASP, dependencias vulnerables |
| **Deuda técnica** | Archivos grandes, duplicación, TODOs |
| **Complejidad** | Nesting profundo, funciones con múltiples responsabilidades |
| **Estándares** | Naming, organización, linters |

## Ejemplo de salida

```
### Resumen ejecutivo
Stack: TypeScript + React + Vitest | 42 archivos | ~8.500 líneas

Issues encontrados:
  🔴 Crítico: 2
  🟠 Alto: 4
  🟡 Medio: 9
  🟢 Bajo: 6

[🔴 SEGURIDAD] API key hardcodeada
Ubicación: src/api/client.ts:14
Acción: Mover a variable de entorno
Esfuerzo: bajo

[🟠 TESTING] Módulo de autenticación sin cobertura
Ubicación: src/auth/
Acción: Añadir tests de integración para login/logout/refresh
Esfuerzo: medio
```

## Tools utilizadas

- `Read` — Lee archivos del proyecto
- `Bash` — Ejecuta comandos (`npm test`, `npm audit`, etc.)
- `Glob` — Explora la estructura del proyecto
- `Grep` — Busca patrones en el código
