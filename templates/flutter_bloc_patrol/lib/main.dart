import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'application/blocs/task_bloc/task_bloc.dart';
import 'application/cubits/theme_cubit.dart';
import 'domain/usecases/get_all_tasks.dart';
import 'domain/usecases/manage_task.dart';
import 'infrastructure/datasources/local_task_datasource.dart';
import 'infrastructure/repositories/task_repository_impl.dart';
import 'presentation/router/app_router.dart';
import 'presentation/themes/app_theme.dart';
import 'presentation/l10n/app_localizations.dart';

void main() {
  // Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Set up dependency injection
  final localDataSource = const LocalTaskDataSource();
  final taskRepository = TaskRepositoryImpl(localDataSource: localDataSource);
  final getAllTasks = GetAllTasks(taskRepository);
  final manageTask = ManageTask(taskRepository);

  runApp(MyApp(
    getAllTasks: getAllTasks,
    manageTask: manageTask,
  ));
}

/// Main application widget with dependency injection and global state management.
/// 
/// This widget sets up the application's dependency injection, theme management,
/// internationalization, and routing using clean architecture principles.
class MyApp extends StatelessWidget {
  const MyApp({
    super.key,
    required this.getAllTasks,
    required this.manageTask,
  });

  final GetAllTasks getAllTasks;
  final ManageTask manageTask;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        // Theme management
        BlocProvider(
          create: (_) => ThemeCubit(),
        ),
        // Task management
        BlocProvider(
          create: (_) => TaskBloc(
            getAllTasks: getAllTasks,
            manageTask: manageTask,
          ),
        ),
      ],
      child: const AppView(),
    );
  }
}

/// Application view widget that builds the MaterialApp with theme and routing.
class AppView extends StatelessWidget {
  const AppView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, ThemeState>(
      buildWhen: (previous, current) => previous.themeMode != current.themeMode,
      builder: (context, state) {
        return MaterialApp.router(
          // Application metadata
          title: '{{project-name}}',
          debugShowCheckedModeBanner: false,

          // Theming
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: state.themeMode,

          // Internationalization
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en', ''), // English
            Locale('es', ''), // Spanish
          ],
          locale: const Locale('en', ''), // Default locale

          // Routing
          routerConfig: AppRouter.router,

          // Builder for additional configuration
          builder: (context, child) {
            return MediaQuery(
              // Handle system font scaling
              data: MediaQuery.of(context).copyWith(
                textScaler: MediaQuery.of(context).textScaler.clamp(
                  minScaleFactor: 0.8,
                  maxScaleFactor: 1.4,
                ),
              ),
              child: child ?? const SizedBox.shrink(),
            );
          },
        );
      },
    );
  }
}