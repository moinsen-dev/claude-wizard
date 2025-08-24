import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../application/cubits/theme_cubit.dart';

/// Settings page for app configuration and preferences.
class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Theme'),
            subtitle: BlocBuilder<ThemeCubit, ThemeState>(
              builder: (context, state) {
                return Text(context.read<ThemeCubit>().currentThemeName);
              },
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showThemeDialog(context),
          ),
        ],
      ),
    );
  }

  void _showThemeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Light'),
              onTap: () {
                context.read<ThemeCubit>().setLightTheme();
                Navigator.of(context).pop();
              },
            ),
            ListTile(
              title: const Text('Dark'),
              onTap: () {
                context.read<ThemeCubit>().setDarkTheme();
                Navigator.of(context).pop();
              },
            ),
            ListTile(
              title: const Text('System'),
              onTap: () {
                context.read<ThemeCubit>().setSystemTheme();
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }
}