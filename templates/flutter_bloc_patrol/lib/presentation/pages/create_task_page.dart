import 'package:flutter/material.dart';

/// Create task page for adding new tasks.
class CreateTaskPage extends StatelessWidget {
  const CreateTaskPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Task'),
      ),
      body: const Center(
        child: Text('Create Task Page - TODO'),
      ),
    );
  }
}