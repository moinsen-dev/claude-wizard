# Flutter Bloc Patrol Template

A comprehensive Flutter template with Bloc architecture, Domain-driven design (DDD), Patrol testing framework, and multi-platform support. This template provides a production-ready foundation for building scalable Flutter applications with clean architecture principles, comprehensive testing, and CI/CD integration.

## Features

- **Clean Architecture**: Domain-driven design (DDD) with proper layer separation
- **State Management**: Flutter Bloc without code generation for predictable state management
- **Testing Framework**: Patrol testing for UI testing plus comprehensive unit tests
- **Multi-Platform**: Support for iOS, Android, Web, and Desktop with responsive design
- **Modern Navigation**: Go Router (Navigation 2.0) for declarative routing
- **Theming System**: Complete dark/light mode implementation with theme switching
- **Internationalization**: Full i18n support with example translations
- **Styled Components**: Reusable widget system with consistent design patterns
- **Data Persistence**: SharedPreferences integration with architectural patterns
- **CI/CD Pipeline**: CodeMagic configuration for automated testing and deployment
- **Code Quality**: Comprehensive linting, formatting, and analysis rules
- **Documentation**: Extensive inline documentation and usage examples

## Dependencies

- flutter_bloc
- equatable
- shared_preferences
- go_router
- flutter_localizations
- intl
- patrol
- mocktail
- flutter_test

## Tools

- Patrol for UI testing and native automation
- Flutter Bloc for state management without code generation
- Go Router for declarative navigation
- SharedPreferences for local storage
- CodeMagic for CI/CD pipeline
- Flutter analyzer for code quality
- Custom lint rules for architectural compliance

## Setup

```bash
flutter create --platforms=android,ios,web,linux,macos,windows .
flutter pub get
flutter packages pub run build_runner build
dart run patrol_cli develop
```

Initialize the project:
```bash
flutter pub get
flutter analyze
flutter test
dart run patrol_cli develop
```

Run the application:
```bash
flutter run
```

Run tests:
```bash
flutter test
dart run patrol_cli test
```

Build for production:
```bash
flutter build apk --release
flutter build ios --release
flutter build web --release
flutter build linux --release
flutter build macos --release
flutter build windows --release
```