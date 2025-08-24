import 'package:flutter/material.dart';

/// Widget that displays task statistics.
class TaskStatsWidget extends StatelessWidget {
  const TaskStatsWidget({
    super.key,
    required this.totalTasks,
    required this.completedTasks,
    required this.incompleteTasks,
    required this.overdueTasks,
  });

  final int totalTasks;
  final int completedTasks;
  final int incompleteTasks;
  final int overdueTasks;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).round() : 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _StatCard(
          title: 'Total Tasks',
          value: totalTasks.toString(),
          icon: Icons.task_alt,
          color: theme.colorScheme.primary,
        ),
        const SizedBox(height: 16),
        _StatCard(
          title: 'Completed',
          value: completedTasks.toString(),
          icon: Icons.check_circle,
          color: Colors.green,
        ),
        const SizedBox(height: 16),
        _StatCard(
          title: 'In Progress',
          value: incompleteTasks.toString(),
          icon: Icons.pending_actions,
          color: Colors.orange,
        ),
        const SizedBox(height: 16),
        _StatCard(
          title: 'Overdue',
          value: overdueTasks.toString(),
          icon: Icons.warning,
          color: Colors.red,
        ),
        const SizedBox(height: 16),
        Text(
          'Completion Rate: $completionRate%',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: totalTasks > 0 ? completedTasks / totalTasks : 0,
          backgroundColor: theme.colorScheme.surfaceVariant,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: color,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                Text(
                  value,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}