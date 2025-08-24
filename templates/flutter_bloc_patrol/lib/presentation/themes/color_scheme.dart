import 'package:flutter/material.dart';

/// Application color schemes for light and dark themes.
/// 
/// This class defines the color palettes using Material Design 3
/// color system, ensuring proper contrast ratios and accessibility
/// across both light and dark themes.
class AppColorScheme {
  const AppColorScheme._();

  /// Light theme color scheme
  static const ColorScheme lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    
    // Primary colors
    primary: Color(0xFF1976D2), // Blue
    onPrimary: Color(0xFFFFFFFF),
    primaryContainer: Color(0xFFBBDEFB),
    onPrimaryContainer: Color(0xFF0D47A1),
    
    // Secondary colors
    secondary: Color(0xFF03DAC6), // Teal
    onSecondary: Color(0xFF000000),
    secondaryContainer: Color(0xFFB2DFDB),
    onSecondaryContainer: Color(0xFF00695C),
    
    // Tertiary colors
    tertiary: Color(0xFFFF7043), // Orange
    onTertiary: Color(0xFFFFFFFF),
    tertiaryContainer: Color(0xFFFFCCBC),
    onTertiaryContainer: Color(0xFFBF360C),
    
    // Error colors
    error: Color(0xFFD32F2F),
    onError: Color(0xFFFFFFFF),
    errorContainer: Color(0xFFFFCDD2),
    onErrorContainer: Color(0xFFB71C1C),
    
    // Surface colors
    surface: Color(0xFFFAFAFA),
    onSurface: Color(0xFF1C1B1F),
    surfaceContainerHighest: Color(0xFFE3E2E6),
    
    // Background (deprecated but still used)
    background: Color(0xFFFAFAFA),
    onBackground: Color(0xFF1C1B1F),
    
    // Variant colors
    outline: Color(0xFF79747E),
    outlineVariant: Color(0xFFCAC4D0),
    surfaceTint: Color(0xFF1976D2),
    onSurfaceVariant: Color(0xFF49454F),
    inverseSurface: Color(0xFF313033),
    onInverseSurface: Color(0xFFF4EFF4),
    inversePrimary: Color(0xFF90CAF9),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
  );

  /// Dark theme color scheme
  static const ColorScheme darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    
    // Primary colors
    primary: Color(0xFF90CAF9), // Light Blue
    onPrimary: Color(0xFF003C71),
    primaryContainer: Color(0xFF0D47A1),
    onPrimaryContainer: Color(0xFFBBDEFB),
    
    // Secondary colors
    secondary: Color(0xFF4DB6AC), // Light Teal
    onSecondary: Color(0xFF003D35),
    secondaryContainer: Color(0xFF00695C),
    onSecondaryContainer: Color(0xFFB2DFDB),
    
    // Tertiary colors
    tertiary: Color(0xFFFFAB91), // Light Orange
    onTertiary: Color(0xFF8D2F00),
    tertiaryContainer: Color(0xFFBF360C),
    onTertiaryContainer: Color(0xFFFFCCBC),
    
    // Error colors
    error: Color(0xFFF48FB1),
    onError: Color(0xFF690005),
    errorContainer: Color(0xFF93000A),
    onErrorContainer: Color(0xFFFFCDD2),
    
    // Surface colors
    surface: Color(0xFF101418),
    onSurface: Color(0xFFE6E1E5),
    surfaceContainerHighest: Color(0xFF332D41),
    
    // Background (deprecated but still used)
    background: Color(0xFF101418),
    onBackground: Color(0xFFE6E1E5),
    
    // Variant colors
    outline: Color(0xFF938F99),
    outlineVariant: Color(0xFF49454F),
    surfaceTint: Color(0xFF90CAF9),
    onSurfaceVariant: Color(0xFFCAC4D0),
    inverseSurface: Color(0xFFE6E1E5),
    onInverseSurface: Color(0xFF313033),
    inversePrimary: Color(0xFF1976D2),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
  );

  /// Custom semantic colors for specific use cases
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFF81C784);
  static const Color successDark = Color(0xFF2E7D32);
  
  static const Color warning = Color(0xFFFF9800);
  static const Color warningLight = Color(0xFFFFB74D);
  static const Color warningDark = Color(0xFFF57C00);
  
  static const Color info = Color(0xFF2196F3);
  static const Color infoLight = Color(0xFF64B5F6);
  static const Color infoDark = Color(0xFF1565C0);

  /// Priority-based colors for tasks
  static const Color lowPriority = Color(0xFF4CAF50);
  static const Color mediumPriority = Color(0xFFFF9800);
  static const Color highPriority = Color(0xFFFF5722);
  static const Color urgentPriority = Color(0xFFD32F2F);

  /// Get priority color based on priority level
  static Color getPriorityColor(int priorityValue) {
    switch (priorityValue) {
      case 1:
        return lowPriority;
      case 2:
        return mediumPriority;
      case 3:
        return highPriority;
      case 4:
        return urgentPriority;
      default:
        return mediumPriority;
    }
  }

  /// Surface elevation colors for light theme
  static const Map<int, Color> lightElevationColors = {
    0: Color(0xFFFAFAFA),
    1: Color(0xFFF5F5F5),
    2: Color(0xFFEEEEEE),
    3: Color(0xFFE0E0E0),
    4: Color(0xFFBDBDBD),
    6: Color(0xFF9E9E9E),
  };

  /// Surface elevation colors for dark theme
  static const Map<int, Color> darkElevationColors = {
    0: Color(0xFF101418),
    1: Color(0xFF1E1E1E),
    2: Color(0xFF232323),
    3: Color(0xFF252525),
    4: Color(0xFF272727),
    6: Color(0xFF2C2C2C),
  };

  /// Get elevation color for the given elevation level
  static Color getElevationColor(int elevation, bool isDark) {
    final colors = isDark ? darkElevationColors : lightElevationColors;
    return colors[elevation] ?? colors[0]!;
  }
}