# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with specialized agents in this repository.

## Project Overview

**YACS** (Yet Another Claude Skills Repo) is a curated collection of reusable Skills and Agents for Claude Code. The skills cover a wide range of topics — from code quality and best practices to analysis of unconventional or unorthodox ideas. Agents are specialized autonomous tools for complex, multi-step tasks.

## Repository Details

- **Remote:** https://github.com/Mammals-at-work/YACS.git (updated from munchkin09)
- **Primary branch:** main
- **Platform:** Cross-platform (macOS, Linux, Windows with case considerations)
- **Language:** Spanish may be used in documentation and skill descriptions

## Structure

### Skills

```
skills/
  <category>/           # Thematic folder (e.g., code-quality, development)
    <skill-name>/       # One folder per skill
      SKILL.md          # Skill prompt/definition
      tools/            # Optional: helper scripts or tools
      ...               # Any other supporting files
```

### Agents

```
agents/
  <agent-name>/         # One folder per agent
    agent.ts            # Main agent implementation
    config.ts           # Configuration and types
    package.json        # Dependencies
    README.md           # Documentation
    example.ts          # Usage examples
    tsconfig.json       # TypeScript configuration
```

## Available Agents

### `codebase-quality-analyzer`

Specialized agent for comprehensive codebase quality analysis and issue prioritization.

**Capabilities:**
- Testing: Coverage analysis and test gap identification
- Security: OWASP vulnerability scanning and secrets detection
- Technical Debt: Complexity and maintainability issues
- Complexity: Cyclomatic complexity and cognitive load analysis
- Standards: Code style, patterns, and documentation review

**Usage:**
```bash
/codebase-quality-analyzer /path/to/project
```

**Output:**
- Prioritized issues by severity (critical → low)
- Specific file locations and line references
- Actionable recommendations with effort estimates
- Quick wins and strategic improvements

**Tech Stack:** TypeScript, Claude Agent SDK, Anthropic API

## Notes

- Each skill/agent lives in its own folder inside a category/agents directory
- Skills are prompt-based; agents are code-based autonomous tools
- Both support integration with Claude Code and standalone execution
- Documentation in English and Spanish is supported
