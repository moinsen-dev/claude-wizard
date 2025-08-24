part of 'task_bloc.dart';

/// Base class for all task-related events.
/// 
/// Events represent user intentions or external triggers that should
/// cause state changes in the TaskBloc.
sealed class TaskEvent extends Equatable {
  const TaskEvent();

  @override
  List<Object?> get props => [];
}

/// Event to request loading all tasks from the repository.
class TaskLoadRequested extends TaskEvent {
  const TaskLoadRequested();
}

/// Event to create a new task.
class TaskCreated extends TaskEvent {
  const TaskCreated({
    required this.title,
    required this.description,
    required this.priority,
    this.dueDate,
  });

  final String title;
  final String description;
  final TaskPriority priority;
  final DateTime? dueDate;

  @override
  List<Object?> get props => [title, description, priority, dueDate];
}

/// Event to update an existing task.
class TaskUpdated extends TaskEvent {
  const TaskUpdated({
    required this.taskId,
    this.title,
    this.description,
    this.priority,
    this.dueDate,
  });

  final String taskId;
  final String? title;
  final String? description;
  final TaskPriority? priority;
  final DateTime? dueDate;

  @override
  List<Object?> get props => [taskId, title, description, priority, dueDate];
}

/// Event to delete a task.
class TaskDeleted extends TaskEvent {
  const TaskDeleted(this.taskId);

  final String taskId;

  @override
  List<Object?> get props => [taskId];
}

/// Event to toggle the completion status of a task.
class TaskCompletionToggled extends TaskEvent {
  const TaskCompletionToggled(this.taskId);

  final String taskId;

  @override
  List<Object?> get props => [taskId];
}

/// Event to clear all tasks from the state.
class TasksCleared extends TaskEvent {
  const TasksCleared();
}