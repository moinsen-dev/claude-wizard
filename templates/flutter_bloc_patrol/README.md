# {{project-name}}

{{description}}

A Flutter application built with clean architecture principles, featuring Bloc state management, Domain-driven design (DDD), comprehensive testing with Patrol, and multi-platform support.

## Features

- ✨ **Clean Architecture**: Domain-driven design with proper layer separation
- 🏛️ **State Management**: Flutter Bloc without code generation for predictable state management
- 🧪 **Testing**: Comprehensive testing with Patrol for UI testing and unit tests
- 📱 **Multi-Platform**: Support for iOS, Android, Web, and Desktop with responsive design
- 🚀 **Modern Navigation**: Go Router (Navigation 2.0) for declarative routing
- 🎨 **Theming**: Complete dark/light mode implementation with theme switching
- 🌍 **Internationalization**: Full i18n support with example translations
- 🎯 **Styled Components**: Reusable widget system with consistent design patterns
- 💾 **Data Persistence**: SharedPreferences integration with architectural patterns
- 🔄 **CI/CD**: CodeMagic configuration for automated testing and deployment

## Architecture

This project follows Domain-driven Design (DDD) principles with clean architecture:

```
lib/
├── domain/              # Business logic and entities
│   ├── entities/        # Domain models
│   ├── repositories/    # Repository interfaces
│   └── usecases/        # Business use cases
├── application/         # Application logic
│   ├── blocs/          # Bloc state management
│   └── cubits/         # Simple state management
├── infrastructure/     # External concerns
│   ├── datasources/    # Data sources (local/remote)
│   ├── repositories/   # Repository implementations
│   └── services/       # External services
└── presentation/       # UI layer
    ├── pages/          # Screen widgets
    ├── widgets/        # Reusable widgets
    ├── themes/         # App theming
    └── l10n/          # Localization
```

### Layer Responsibilities

- **Domain**: Contains business logic, entities, and repository contracts
- **Application**: Contains use cases and state management (Bloc/Cubit)
- **Infrastructure**: Implements external concerns like data sources and services
- **Presentation**: Contains UI components, themes, and localization

## Getting Started

### Prerequisites

- Flutter SDK (>=3.16.0)
- Dart SDK (>=3.2.0)
- IDE with Flutter support (VS Code, Android Studio, IntelliJ)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd {{project_name}}
```

2. Get dependencies:
```bash
flutter pub get
```

3. Generate localizations:
```bash
flutter gen-l10n
```

4. Run the app:
```bash
flutter run
```

### Platform Setup

#### Android
```bash
flutter run -d android
```

#### iOS
```bash
flutter run -d ios
```

#### Web
```bash
flutter run -d web
```

#### Desktop
```bash
# Linux
flutter run -d linux

# macOS
flutter run -d macos

# Windows
flutter run -d windows
```

## Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests with Patrol
```bash
# Install Patrol CLI
dart pub global activate patrol_cli

# Run Patrol tests
patrol test
```

### Test Coverage
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
```

## Building for Production

### Android
```bash
# APK
flutter build apk --release

# App Bundle (recommended for Play Store)
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

### Desktop
```bash
flutter build linux --release
flutter build macos --release
flutter build windows --release
```

## Code Quality

This project maintains high code quality standards:

- **Linting**: Uses `very_good_analysis` for comprehensive linting
- **Testing**: 100% test coverage requirement
- **Architecture**: Enforced clean architecture principles
- **Type Safety**: Strict null safety enabled

### Code Analysis
```bash
flutter analyze
```

### Code Formatting
```bash
dart format .
```

## State Management

The app uses Flutter Bloc for state management with the following patterns:

- **Blocs**: For complex state management with multiple events
- **Cubits**: For simple state management
- **Repository Pattern**: For data access abstraction
- **Use Cases**: For business logic encapsulation

### Example: Adding a New Feature

1. **Domain Layer**: Define entities and repository interfaces
2. **Application Layer**: Create use cases and Bloc/Cubit
3. **Infrastructure Layer**: Implement repositories and data sources
4. **Presentation Layer**: Create UI components and wire everything together

## Internationalization

The app supports multiple languages with Flutter's built-in i18n:

- English (default)
- Spanish (example)

### Adding New Translations

1. Add translations to `lib/presentation/l10n/app_*.arb`
2. Run `flutter gen-l10n` to generate localization files
3. Use `AppLocalizations.of(context)!.yourKey` in widgets

## Theming

The app supports dynamic theming with:

- Light mode
- Dark mode  
- System theme (follows device setting)
- Custom color schemes
- Typography scales

### Customizing Themes

Edit `lib/presentation/themes/` files to customize:
- Colors
- Typography
- Component themes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the established patterns
4. Ensure tests pass: `flutter test`
5. Ensure code quality: `flutter analyze`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a pull request

### Commit Convention

This project follows conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/config changes

## CI/CD

The project uses CodeMagic for continuous integration and deployment:

- Automated testing on all platforms
- Code quality checks
- Multi-platform builds
- Deployment to app stores

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flutter team for the amazing framework
- Bloc library for state management patterns
- Patrol team for testing framework
- Community contributors

---

Built with ❤️ using Flutter and clean architecture principles.