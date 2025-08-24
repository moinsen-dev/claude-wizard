"""Main module for {{project-name}}."""

import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class {{ProjectName}}:
    """Main application class for {{project-name}}."""
    
    def __init__(self, name: str = "{{project-name}}"):
        """Initialize the {{ProjectName}} application.
        
        Args:
            name: The application name
        """
        self.name = name
        self.version = "1.0.0"
        self.author = "{{author}}"
        logger.info(f"Initialized {self.name} v{self.version}")
    
    def run(self) -> None:
        """Run the main application logic."""
        print(f"🚀 Hello from {self.name}!")
        print(f"📝 Created by: {self.author}")
        print(f"📅 Year: {{year}}")
        print(f"🐍 This is a {{Language}} project")
        
    def greet(self, name: Optional[str] = None) -> str:
        """Generate a greeting message.
        
        Args:
            name: Optional name to greet
            
        Returns:
            A greeting message
        """
        if name:
            return f"Hello {name}, welcome to {self.name}!"
        return f"Hello from {self.name}!"


def main():
    """Entry point for the {{project-name}} application."""
    app = {{ProjectName}}()
    app.run()
    
    # Example usage
    print("\nExample usage:")
    print(app.greet())
    print(app.greet("Developer"))


if __name__ == "__main__":
    main()