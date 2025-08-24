import 'package:flutter/material.dart';

import '../../domain/entities/task.dart';

/// Widget that displays a list of tasks.
class TaskListWidget extends StatelessWidget {
  const TaskListWidget({
    super.key,
    required this.tasks,
    this.scrollController,
    this.onTaskTap,
    this.onTaskCompletionChanged,
  });

  final List<Task> tasks;
  final ScrollController? scrollController;
  final void Function(Task task)? onTaskTap;
  final void Function(Task task)? onTaskCompletionChanged;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: tasks.length,
      itemBuilder: (context, index) {
        final task = tasks[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Checkbox(
              value: task.isCompleted,
              onChanged: (_) => onTaskCompletionChanged?.call(task),
            ),
            title: Text(
              task.title,
              style: task.isCompleted
                  ? const TextStyle(decoration: TextDecoration.lineThrough)
                  : null,
            ),
            subtitle: Text(task.description),
            trailing: Icon(
              _getPriorityIcon(task.priority),
              color: _getPriorityColor(task.priority),
            ),
            onTap: () => onTaskTap?.call(task),
          ),
        );
      },
    );
  }

  IconData _getPriorityIcon(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.low:
        return Icons.keyboard_arrow_down;
      case TaskPriority.medium:
        return Icons.remove;
      case TaskPriority.high:
        return Icons.keyboard_arrow_up;
      case TaskPriority.urgent:
        return Icons.priority_high;
    }
  }

  Color _getPriorityColor(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.low:
        return Colors.green;
      case TaskPriority.medium:
        return Colors.orange;
      case TaskPriority.high:
        return Colors.red;
      case TaskPriority.urgent:
        return Colors.deepOrange;
    }
  }
}