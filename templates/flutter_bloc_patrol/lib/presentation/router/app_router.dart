import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../pages/home_page.dart';
import '../pages/task_detail_page.dart';
import '../pages/create_task_page.dart';
import '../pages/settings_page.dart';
import '../pages/splash_page.dart';

/// Application router configuration using Go Router.
/// 
/// This class defines all application routes and handles navigation
/// logic following declarative routing patterns with type-safe navigation.
class AppRouter {
  const AppRouter._();

  /// Route paths
  static const String splash = '/splash';
  static const String home = '/';
  static const String taskDetail = '/task/:taskId';
  static const String createTask = '/create-task';
  static const String settings = '/settings';

  /// Router configuration
  static final GoRouter router = GoRouter(
    initialLocation: splash,
    debugLogDiagnostics: true,
    routes: [
      // Splash route
      GoRoute(
        path: splash,
        name: 'splash',
        pageBuilder: (context, state) => CustomTransitionPage<void>(
          key: state.pageKey,
          child: const SplashPage(),
          transitionsBuilder: (context, animation, _, child) =>
              FadeTransition(opacity: animation, child: child),
        ),
      ),

      // Home route with nested routes
      GoRoute(
        path: home,
        name: 'home',
        pageBuilder: (context, state) => CustomTransitionPage<void>(
          key: state.pageKey,
          child: const HomePage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              _slideTransition(animation, secondaryAnimation, child),
        ),
      ),

      // Task detail route
      GoRoute(
        path: taskDetail,
        name: 'taskDetail',
        pageBuilder: (context, state) {
          final taskId = state.pathParameters['taskId']!;
          return CustomTransitionPage<void>(
            key: state.pageKey,
            child: TaskDetailPage(taskId: taskId),
            transitionsBuilder: (context, animation, secondaryAnimation, child) =>
                _slideTransition(animation, secondaryAnimation, child),
          );
        },
      ),

      // Create task route
      GoRoute(
        path: createTask,
        name: 'createTask',
        pageBuilder: (context, state) => CustomTransitionPage<void>(
          key: state.pageKey,
          child: const CreateTaskPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              _slideTransition(animation, secondaryAnimation, child, slideUp: true),
        ),
      ),

      // Settings route
      GoRoute(
        path: settings,
        name: 'settings',
        pageBuilder: (context, state) => CustomTransitionPage<void>(
          key: state.pageKey,
          child: const SettingsPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              _slideTransition(animation, secondaryAnimation, child),
        ),
      ),
    ],

    // Error handling
    errorPageBuilder: (context, state) => MaterialPage<void>(
      key: state.pageKey,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Page Not Found'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'Page Not Found',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                'The page you are looking for does not exist.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => context.go(home),
                icon: const Icon(Icons.home),
                label: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    ),

    // Redirect logic
    redirect: (context, state) {
      // You can add authentication checks here
      // For now, we'll just handle splash screen logic
      
      // If we're on splash and app is initialized, go to home
      if (state.matchedLocation == splash) {
        // In a real app, you'd check if the app is initialized
        // For this example, we'll assume it's always ready
        return null; // Stay on splash for now
      }

      return null; // No redirect
    },
  );

  /// Custom slide transition
  static Widget _slideTransition(
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child, {
    bool slideUp = false,
  }) {
    const begin = Offset(1.0, 0.0);
    const end = Offset.zero;
    const curve = Curves.easeInOutCubic;

    final slideBegin = slideUp ? const Offset(0.0, 1.0) : begin;
    
    final tween = Tween(begin: slideBegin, end: end).chain(
      CurveTween(curve: curve),
    );

    return SlideTransition(
      position: animation.drive(tween),
      child: SlideTransition(
        position: secondaryAnimation.drive(
          Tween(begin: end, end: const Offset(-0.3, 0.0)).chain(
            CurveTween(curve: curve),
          ),
        ),
        child: child,
      ),
    );
  }
}

/// Extension methods for type-safe navigation
extension AppRouterExtension on BuildContext {
  /// Navigate to home page
  void goHome() => go(AppRouter.home);

  /// Navigate to task detail page
  void goTaskDetail(String taskId) => go('/task/$taskId');

  /// Navigate to create task page
  void goCreateTask() => go(AppRouter.createTask);

  /// Navigate to settings page
  void goSettings() => go(AppRouter.settings);

  /// Push task detail page
  void pushTaskDetail(String taskId) => push('/task/$taskId');

  /// Push create task page
  void pushCreateTask() => push(AppRouter.createTask);

  /// Push settings page
  void pushSettings() => push(AppRouter.settings);
}

/// Router helper class with static methods for navigation outside of widget context
class AppNavigation {
  const AppNavigation._();

  /// Get the current router instance
  static GoRouter get router => AppRouter.router;

  /// Navigate to home page
  static void goHome() => router.go(AppRouter.home);

  /// Navigate to task detail page
  static void goTaskDetail(String taskId) => router.go('/task/$taskId');

  /// Navigate to create task page
  static void goCreateTask() => router.go(AppRouter.createTask);

  /// Navigate to settings page
  static void goSettings() => router.go(AppRouter.settings);

  /// Push task detail page
  static void pushTaskDetail(String taskId) => router.push('/task/$taskId');

  /// Push create task page
  static void pushCreateTask() => router.push(AppRouter.createTask);

  /// Push settings page
  static void pushSettings() => router.push(AppRouter.settings);

  /// Go back
  static void goBack() => router.pop();

  /// Check if can go back
  static bool canGoBack() => router.canPop();
}