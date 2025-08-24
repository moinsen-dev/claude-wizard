import 'package:flutter/material.dart';

/// Application text theme configuration.
/// 
/// This class defines the typography scale following Material Design 3
/// guidelines, providing consistent text styling across the application
/// with the Inter font family.
class AppTextTheme {
  const AppTextTheme._();

  /// Base text theme using Inter font family
  static const TextTheme textTheme = TextTheme(
    // Display styles (largest text)
    displayLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 57.0,
      fontWeight: FontWeight.w400,
      letterSpacing: -0.25,
      height: 1.12,
    ),
    displayMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 45.0,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.0,
      height: 1.16,
    ),
    displaySmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 36.0,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.0,
      height: 1.22,
    ),

    // Headline styles
    headlineLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 32.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.0,
      height: 1.25,
    ),
    headlineMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 28.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.0,
      height: 1.29,
    ),
    headlineSmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 24.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.0,
      height: 1.33,
    ),

    // Title styles
    titleLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 22.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.0,
      height: 1.27,
    ),
    titleMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 16.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.15,
      height: 1.5,
    ),
    titleSmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 14.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.1,
      height: 1.43,
    ),

    // Body styles (most common text)
    bodyLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 16.0,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.5,
      height: 1.5,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 14.0,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.25,
      height: 1.43,
    ),
    bodySmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 12.0,
      fontWeight: FontWeight.w400,
      letterSpacing: 0.4,
      height: 1.33,
    ),

    // Label styles (buttons, tabs, etc.)
    labelLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 14.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.1,
      height: 1.43,
    ),
    labelMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 12.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
      height: 1.33,
    ),
    labelSmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 11.0,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
      height: 1.45,
    ),
  );

  /// Custom text styles for specific use cases
  
  /// Card title style
  static const TextStyle cardTitle = TextStyle(
    fontFamily: 'Inter',
    fontSize: 18.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0,
    height: 1.33,
  );

  /// Card subtitle style
  static const TextStyle cardSubtitle = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14.0,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    height: 1.43,
  );

  /// Caption style for small descriptive text
  static const TextStyle caption = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12.0,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
    height: 1.33,
  );

  /// Overline style for categories and labels
  static const TextStyle overline = TextStyle(
    fontFamily: 'Inter',
    fontSize: 10.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 1.5,
    height: 1.6,
  );

  /// Button text style
  static const TextStyle button = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
    height: 1.43,
  );

  /// Input label style
  static const TextStyle inputLabel = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12.0,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.4,
    height: 1.33,
  );

  /// Input text style
  static const TextStyle inputText = TextStyle(
    fontFamily: 'Inter',
    fontSize: 16.0,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    height: 1.5,
  );

  /// Tab label style
  static const TextStyle tabLabel = TextStyle(
    fontFamily: 'Inter',
    fontSize: 14.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
    height: 1.43,
  );

  /// App bar title style
  static const TextStyle appBarTitle = TextStyle(
    fontFamily: 'Inter',
    fontSize: 20.0,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.0,
    height: 1.3,
  );

  /// Navigation label style
  static const TextStyle navigationLabel = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12.0,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.33,
  );

  /// Error text style
  static const TextStyle errorText = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12.0,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.4,
    height: 1.33,
  );

  /// Success text style
  static const TextStyle successText = TextStyle(
    fontFamily: 'Inter',
    fontSize: 12.0,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.4,
    height: 1.33,
  );

  /// Priority badge style
  static const TextStyle priorityBadge = TextStyle(
    fontFamily: 'Inter',
    fontSize: 10.0,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.5,
    height: 1.2,
  );

  /// Code style for monospace text
  static const TextStyle code = TextStyle(
    fontFamily: 'Courier',
    fontSize: 14.0,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.0,
    height: 1.43,
  );
}