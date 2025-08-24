# {{project-name}}

{{description}}

Created with the Python Minimal Template for claude-wizard.

## Features

- 🐍 Modern Python project structure
- 🧪 Testing with pytest
- 🎨 Code formatting with ruff
- 🔍 Type checking with mypy
- 📦 Package management with uv
- 🚀 Ready to use and extend

## Installation

This project uses [uv](https://github.com/astral-sh/uv) for dependency management.

```bash
# Install dependencies
uv sync

# Install in development mode
uv pip install -e .
```

## Usage

### As a module
```bash
uv run python -m {{project_name}}
```

### As a script
```bash
uv run {{project_name}}
```

### In Python code
```python
from {{project_name}} import {{ProjectName}}

app = {{ProjectName}}("My App")
app.run()
print(app.greet("World"))
```

## Development

### Running tests
```bash
uv run pytest
```

### Code formatting
```bash
uv run ruff format
```

### Linting
```bash
uv run ruff check
```

### Type checking
```bash
uv run mypy {{project_name}}
```

### All checks
```bash
uv run ruff check && uv run ruff format --check && uv run mypy {{project_name}} && uv run pytest
```

## Project Structure

```
{{project-name}}/
├── {{project_name}}/          # Main package
│   ├── __init__.py           # Package metadata
│   ├── __main__.py           # Module entry point
│   └── main.py               # Application logic
├── tests/                    # Test suite
│   ├── __init__.py
│   └── test_{{project_name}}.py
├── pyproject.toml            # Project configuration
├── README.md                 # This file
└── .gitignore                # Git ignore patterns
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run the tests: `uv run pytest`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Created by {{author}} in {{year}}.