import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:patrol/patrol.dart';

import 'package:{{project_name}}/main.dart' as app;

/// Integration tests using Patrol testing framework.
/// 
/// These tests demonstrate end-to-end testing capabilities including
/// navigation, user interactions, and native platform integration.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('{{ProjectName}} Integration Tests', () {
    patrolTest('App launches and displays splash screen', (PatrolTester $) async {
      // Launch the app
      app.main();
      await $.pumpAndSettle();

      // Verify splash screen is displayed
      expect($('{{project-name}}'), findsOneWidget);
      expect($('Task Management Made Simple'), findsOneWidget);
      expect($(CircularProgressIndicator), findsOneWidget);

      // Wait for navigation to home
      await $.pumpAndSettle(const Duration(seconds: 3));
      
      // Verify we navigated to home page
      expect($('{{project-name}}'), findsOneWidget); // App bar title
      expect($(FloatingActionButton), findsOneWidget);
    });

    patrolTest('Can navigate to settings', (PatrolTester $) async {
      app.main();
      await $.pumpAndSettle();
      
      // Wait for splash to complete
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Tap settings button in app bar
      await $(Icons.settings).tap();
      await $.pumpAndSettle();

      // Verify we're on settings page
      expect($('Settings'), findsOneWidget);
      expect($('Theme'), findsOneWidget);
    });

    patrolTest('Theme switching works', (PatrolTester $) async {
      app.main();
      await $.pumpAndSettle();
      
      // Wait for splash to complete
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Navigate to settings
      await $(Icons.settings).tap();
      await $.pumpAndSettle();

      // Tap on theme setting
      await $('Theme').tap();
      await $.pumpAndSettle();

      // Verify theme dialog is shown
      expect($('Choose Theme'), findsOneWidget);
      expect($('Light'), findsOneWidget);
      expect($('Dark'), findsOneWidget);
      expect($('System'), findsOneWidget);

      // Select dark theme
      await $('Dark').tap();
      await $.pumpAndSettle();

      // Verify dialog is closed
      expect($('Choose Theme'), findsNothing);
    });

    patrolTest('Can open create task screen', (PatrolTester $) async {
      app.main();
      await $.pumpAndSettle();
      
      // Wait for splash to complete
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Tap the floating action button
      await $(FloatingActionButton).tap();
      await $.pumpAndSettle();

      // Verify we're on create task page
      expect($('Create Task'), findsOneWidget);
    });

    patrolTest('Empty state is shown when no tasks', (PatrolTester $) async {
      app.main();
      await $.pumpAndSettle();
      
      // Wait for splash to complete
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Wait for task loading to complete
      await $.pumpAndSettle();

      // Verify empty state is displayed
      expect($('No tasks available'), findsOneWidget);
      expect($(Icons.task_outlined), findsOneWidget);
    });

    patrolTest('Filter chips work correctly', (PatrolTester $) async {
      app.main();
      await $.pumpAndSettle();
      
      // Wait for splash to complete
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Verify filter chips are present
      expect($('All'), findsOneWidget);
      expect($('Active'), findsOneWidget);
      expect($('Completed'), findsOneWidget);
      expect($('Overdue'), findsOneWidget);

      // Tap on Active filter
      await $('Active').tap();
      await $.pumpAndSettle();

      // Verify the filter is selected (chip should be selected)
      // Note: In a real implementation, you'd verify the visual state change
    });

    group('Responsive Design Tests', () {
      patrolTest('Mobile layout displays correctly', (PatrolTester $) async {
        // Set mobile screen size
        await $.binding.setSurfaceSize(const Size(400, 800));
        
        app.main();
        await $.pumpAndSettle();
        await $.pumpAndSettle(const Duration(seconds: 3));

        // Verify mobile layout elements
        expect($(FloatingActionButton), findsOneWidget);
        expect($(AppBar), findsOneWidget);
      });

      patrolTest('Desktop layout displays correctly', (PatrolTester $) async {
        // Set desktop screen size
        await $.binding.setSurfaceSize(const Size(1200, 800));
        
        app.main();
        await $.pumpAndSettle();
        await $.pumpAndSettle(const Duration(seconds: 3));

        // Verify desktop layout elements are present
        // In a real implementation, you'd check for sidebar, stats panel, etc.
        expect($(FloatingActionButton), findsOneWidget);
        expect($(AppBar), findsOneWidget);
      });
    });

    group('Accessibility Tests', () {
      patrolTest('App is accessible with screen reader', (PatrolTester $) async {
        app.main();
        await $.pumpAndSettle();
        await $.pumpAndSettle(const Duration(seconds: 3));

        // Verify semantic labels are present
        expect(find.bySemanticsLabel('Settings'), findsOneWidget);
        expect(find.bySemanticsLabel('Create Task'), findsOneWidget);
      });

      patrolTest('Buttons have proper semantic properties', (PatrolTester $) async {
        app.main();
        await $.pumpAndSettle();
        await $.pumpAndSettle(const Duration(seconds: 3));

        // Navigate to settings
        await $(Icons.settings).tap();
        await $.pumpAndSettle();

        // Verify accessible elements
        final semantics = $.tester.getSemantics(find.text('Theme'));\n        expect(semantics.hasAction(SemanticsAction.tap), isTrue);\n      });\n    });\n\n    group('Performance Tests', () {\n      patrolTest('App starts within acceptable time', (PatrolTester $) async {\n        final stopwatch = Stopwatch()..start();\n        \n        app.main();\n        await $.pumpAndSettle();\n        await $.pumpAndSettle(const Duration(seconds: 3));\n        \n        stopwatch.stop();\n        \n        // Verify app starts within 5 seconds\n        expect(stopwatch.elapsedMilliseconds, lessThan(5000));\n      });\n    });\n  });\n}"