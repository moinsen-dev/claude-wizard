# Python Minimal Template

A simple Python project template with essential tooling and best practices.

## Features
- Clean project structure with package layout
- Virtual environment setup with uv
- Testing framework with pytest
- Code formatting with ruff
- Type checking with mypy
- Git integration with .gitignore

## Dependencies
- pytest
- ruff
- mypy

## Setup

```bash
uv init {{project-name-kebab}}
cd {{project-name-kebab}}
uv add --dev pytest ruff mypy
uv run pytest
```

Start developing:
```bash
uv run python -m {{project_name}}
```