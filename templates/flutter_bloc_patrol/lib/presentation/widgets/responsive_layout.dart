import 'package:flutter/material.dart';

/// Responsive layout widget that adapts to different screen sizes.
/// 
/// This widget provides a foundation for building responsive UIs that work
/// across mobile, tablet, and desktop platforms by providing different
/// layouts based on screen width breakpoints.
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  /// Widget to display on mobile devices
  final Widget mobile;

  /// Widget to display on tablet devices (optional, falls back to mobile)
  final Widget? tablet;

  /// Widget to display on desktop devices (optional, falls back to tablet or mobile)
  final Widget? desktop;

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth >= BreakPoints.desktop) {
      return desktop ?? tablet ?? mobile;
    } else if (screenWidth >= BreakPoints.tablet) {
      return tablet ?? mobile;
    } else {
      return mobile;
    }
  }

  /// Static method to check if current screen is mobile
  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < BreakPoints.tablet;
  }

  /// Static method to check if current screen is tablet
  static bool isTablet(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    return screenWidth >= BreakPoints.tablet && screenWidth < BreakPoints.desktop;
  }

  /// Static method to check if current screen is desktop
  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= BreakPoints.desktop;
  }
}

/// Responsive breakpoints following Material Design guidelines
class BreakPoints {
  const BreakPoints._();

  /// Mobile breakpoint (0-599dp)
  static const double mobile = 0;

  /// Tablet breakpoint (600-1023dp)
  static const double tablet = 600;

  /// Desktop breakpoint (1024dp+)
  static const double desktop = 1024;

  /// Large desktop breakpoint (1440dp+)
  static const double largeDesktop = 1440;
}

/// Responsive value provider that returns different values based on screen size
class ResponsiveValue<T> {
  const ResponsiveValue({
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  final T mobile;
  final T? tablet;
  final T? desktop;

  /// Get the appropriate value for the current screen size
  T getValue(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    
    if (screenWidth >= BreakPoints.desktop) {
      return desktop ?? tablet ?? mobile;
    } else if (screenWidth >= BreakPoints.tablet) {
      return tablet ?? mobile;
    } else {
      return mobile;
    }
  }
}

/// Responsive padding that adapts to screen size
class ResponsivePadding extends ResponsiveValue<EdgeInsetsGeometry> {
  const ResponsivePadding({
    required super.mobile,
    super.tablet,
    super.desktop,
  });

  /// Convenience constructor for symmetric horizontal padding
  ResponsivePadding.horizontal({
    required double mobile,
    double? tablet,
    double? desktop,
  }) : super(
          mobile: EdgeInsets.symmetric(horizontal: mobile),
          tablet: tablet != null
              ? EdgeInsets.symmetric(horizontal: tablet)
              : null,
          desktop: desktop != null
              ? EdgeInsets.symmetric(horizontal: desktop)
              : null,
        );

  /// Convenience constructor for all-around padding
  ResponsivePadding.all({
    required double mobile,
    double? tablet,
    double? desktop,
  }) : super(
          mobile: EdgeInsets.all(mobile),
          tablet: tablet != null ? EdgeInsets.all(tablet) : null,
          desktop: desktop != null ? EdgeInsets.all(desktop) : null,
        );
}

/// Responsive font size that adapts to screen size
class ResponsiveFontSize extends ResponsiveValue<double> {
  const ResponsiveFontSize({
    required super.mobile,
    super.tablet,
    super.desktop,
  });
}

/// Responsive grid cross axis count
class ResponsiveGridCount extends ResponsiveValue<int> {
  const ResponsiveGridCount({
    required super.mobile,
    super.tablet,
    super.desktop,
  });
}

/// Extension methods for responsive design
extension ResponsiveContext on BuildContext {
  /// Get screen width
  double get screenWidth => MediaQuery.of(this).size.width;

  /// Get screen height
  double get screenHeight => MediaQuery.of(this).size.height;

  /// Check if screen is mobile
  bool get isMobile => ResponsiveLayout.isMobile(this);

  /// Check if screen is tablet
  bool get isTablet => ResponsiveLayout.isTablet(this);

  /// Check if screen is desktop
  bool get isDesktop => ResponsiveLayout.isDesktop(this);

  /// Get responsive value
  T responsive<T>(ResponsiveValue<T> responsiveValue) {
    return responsiveValue.getValue(this);
  }
}