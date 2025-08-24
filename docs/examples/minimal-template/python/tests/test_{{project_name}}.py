"""Tests for {{project_name}} main module."""

import pytest
from {{project_name}}.main import {{ProjectName}}


class Test{{ProjectName}}:
    """Test suite for {{ProjectName}} class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.app = {{ProjectName}}()
    
    def test_initialization(self):
        """Test {{ProjectName}} initialization."""
        assert self.app.name == "{{project-name}}"
        assert self.app.version == "1.0.0"
        assert self.app.author == "{{author}}"
    
    def test_greet_without_name(self):
        """Test greeting without providing a name."""
        result = self.app.greet()
        expected = "Hello from {{project-name}}!"
        assert result == expected
    
    def test_greet_with_name(self):
        """Test greeting with a provided name."""
        result = self.app.greet("Alice")
        expected = "Hello Alice, welcome to {{project-name}}!"
        assert result == expected
    
    def test_custom_name(self):
        """Test {{ProjectName}} with custom name."""
        custom_app = {{ProjectName}}("Custom App")
        assert custom_app.name == "Custom App"
    
    def test_run_method_exists(self):
        """Test that run method exists and is callable."""
        assert hasattr(self.app, 'run')
        assert callable(getattr(self.app, 'run'))


def test_main_function():
    """Test that main function exists and is importable."""
    from {{project_name}}.main import main
    assert callable(main)


if __name__ == "__main__":
    pytest.main([__file__])