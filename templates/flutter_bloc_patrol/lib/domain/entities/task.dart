import 'package:equatable/equatable.dart';

/// Task entity representing a task item in the domain layer.
/// 
/// This entity demonstrates domain-driven design principles by containing
/// business logic and maintaining invariants without external dependencies.
class Task extends Equatable {
  const Task({
    required this.id,
    required this.title,
    required this.description,
    required this.isCompleted,
    required this.priority,
    required this.createdAt,
    this.completedAt,
    this.dueDate,
  });

  /// Unique identifier for the task
  final String id;

  /// Task title
  final String title;

  /// Detailed description of the task
  final String description;

  /// Whether the task is completed
  final bool isCompleted;

  /// Task priority level
  final TaskPriority priority;

  /// When the task was created
  final DateTime createdAt;

  /// When the task was completed (if completed)
  final DateTime? completedAt;

  /// Optional due date for the task
  final DateTime? dueDate;

  /// Creates a copy of this task with the given fields replaced with new values
  Task copyWith({
    String? id,
    String? title,
    String? description,
    bool? isCompleted,
    TaskPriority? priority,
    DateTime? createdAt,
    DateTime? completedAt,
    DateTime? dueDate,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      isCompleted: isCompleted ?? this.isCompleted,
      priority: priority ?? this.priority,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      dueDate: dueDate ?? this.dueDate,
    );
  }

  /// Business logic: Mark task as completed
  Task markCompleted() {
    return copyWith(
      isCompleted: true,
      completedAt: DateTime.now(),
    );
  }

  /// Business logic: Mark task as incomplete
  Task markIncomplete() {
    return copyWith(
      isCompleted: false,
      completedAt: null,
    );
  }

  /// Business logic: Check if task is overdue
  bool get isOverdue {
    if (dueDate == null || isCompleted) return false;
    return DateTime.now().isAfter(dueDate!);
  }

  /// Business logic: Check if task is due soon (within 24 hours)
  bool get isDueSoon {
    if (dueDate == null || isCompleted) return false;
    final now = DateTime.now();
    final tomorrow = now.add(const Duration(hours: 24));
    return dueDate!.isBefore(tomorrow) && dueDate!.isAfter(now);
  }

  /// Business logic: Get task status as string
  String get status {
    if (isCompleted) return 'Completed';
    if (isOverdue) return 'Overdue';
    if (isDueSoon) return 'Due Soon';
    return 'In Progress';
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        isCompleted,
        priority,
        createdAt,
        completedAt,
        dueDate,
      ];

  @override
  String toString() {
    return 'Task(id: $id, title: $title, description: $description, '
        'isCompleted: $isCompleted, priority: $priority, createdAt: $createdAt, '
        'completedAt: $completedAt, dueDate: $dueDate)';
  }
}

/// Enumeration for task priority levels
enum TaskPriority {
  low('Low', 1),
  medium('Medium', 2),
  high('High', 3),
  urgent('Urgent', 4);

  const TaskPriority(this.label, this.value);

  final String label;
  final int value;

  /// Get priority by value
  static TaskPriority fromValue(int value) {
    return TaskPriority.values.firstWhere(
      (priority) => priority.value == value,
      orElse: () => TaskPriority.medium,
    );
  }
}