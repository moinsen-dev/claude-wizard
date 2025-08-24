import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Cubit for managing application theme state.
/// 
/// This cubit handles theme switching between light and dark modes,
/// persists user preference using SharedPreferences, and provides
/// system theme detection capabilities.
class ThemeCubit extends Cubit<ThemeState> {
  ThemeCubit() : super(const ThemeState.initial()) {
    _loadThemePreference();
  }

  static const String _themePreferenceKey = 'theme_preference';

  /// Switches to light theme
  void setLightTheme() {
    emit(state.copyWith(themeMode: ThemeMode.light));
    _saveThemePreference(ThemeMode.light);
  }

  /// Switches to dark theme
  void setDarkTheme() {
    emit(state.copyWith(themeMode: ThemeMode.dark));
    _saveThemePreference(ThemeMode.dark);
  }

  /// Switches to system theme (follows system settings)
  void setSystemTheme() {
    emit(state.copyWith(themeMode: ThemeMode.system));
    _saveThemePreference(ThemeMode.system);
  }

  /// Toggles between light and dark theme
  void toggleTheme() {
    switch (state.themeMode) {
      case ThemeMode.light:
        setDarkTheme();
        break;
      case ThemeMode.dark:
        setLightTheme();
        break;
      case ThemeMode.system:
        // When in system mode, toggle to the opposite of current system setting
        final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
        if (brightness == Brightness.dark) {
          setLightTheme();
        } else {
          setDarkTheme();
        }
        break;
    }
  }

  /// Loads theme preference from SharedPreferences
  Future<void> _loadThemePreference() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeIndex = prefs.getInt(_themePreferenceKey) ?? ThemeMode.system.index;
      
      final themeMode = ThemeMode.values[themeIndex];
      emit(state.copyWith(
        themeMode: themeMode,
        isLoaded: true,
      ));
    } catch (e) {
      // If loading fails, default to system theme
      emit(state.copyWith(
        themeMode: ThemeMode.system,
        isLoaded: true,
      ));
    }
  }

  /// Saves theme preference to SharedPreferences
  Future<void> _saveThemePreference(ThemeMode themeMode) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_themePreferenceKey, themeMode.index);
    } catch (e) {
      // Silently handle save errors - the theme will still work for current session
    }
  }

  /// Gets the display name for the current theme
  String get currentThemeName {
    switch (state.themeMode) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }

  /// Checks if current theme is dark (considering system theme)
  bool isDarkTheme(BuildContext context) {
    switch (state.themeMode) {
      case ThemeMode.light:
        return false;
      case ThemeMode.dark:
        return true;
      case ThemeMode.system:
        return Theme.of(context).brightness == Brightness.dark;
    }
  }
}

/// Immutable state class for theme management.
class ThemeState extends Equatable {
  const ThemeState({
    required this.themeMode,
    required this.isLoaded,
  });

  /// Initial state factory constructor
  const ThemeState.initial() : this(
        themeMode: ThemeMode.system,
        isLoaded: false,
      );

  final ThemeMode themeMode;
  final bool isLoaded;

  /// Whether the theme is light mode
  bool get isLightTheme => themeMode == ThemeMode.light;

  /// Whether the theme is dark mode
  bool get isDarkTheme => themeMode == ThemeMode.dark;

  /// Whether the theme follows system settings
  bool get isSystemTheme => themeMode == ThemeMode.system;

  /// Creates a copy of this state with the given fields replaced with new values
  ThemeState copyWith({
    ThemeMode? themeMode,
    bool? isLoaded,
  }) {
    return ThemeState(
      themeMode: themeMode ?? this.themeMode,
      isLoaded: isLoaded ?? this.isLoaded,
    );
  }

  @override
  List<Object?> get props => [themeMode, isLoaded];

  @override
  String toString() {
    return 'ThemeState(themeMode: $themeMode, isLoaded: $isLoaded)';
  }
}