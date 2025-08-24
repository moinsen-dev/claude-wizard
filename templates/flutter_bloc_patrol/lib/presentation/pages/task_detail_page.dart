import 'package:flutter/material.dart';

/// Task detail page for viewing and editing individual tasks.
class TaskDetailPage extends StatelessWidget {
  const TaskDetailPage({super.key, required this.taskId});

  final String taskId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Navigate to edit task
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Task Detail Page - TODO'),
      ),
    );
  }
}