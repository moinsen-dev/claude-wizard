part of 'task_bloc.dart';

/// Enumeration of possible task state statuses.
enum TaskStateStatus {
  initial,
  loading,
  success,
  failure,
}

/// Immutable state class for the TaskBloc.
/// 
/// This class contains all the state information related to tasks,
/// including loading status, task list, and statistics.
class TaskState extends Equatable {
  const TaskState({
    required this.status,
    this.tasks = const [],
    this.completedCount = 0,
    this.incompleteCount = 0,
    this.overdueCount = 0,
    this.dueSoonCount = 0,
    this.errorMessage,
  });

  /// Initial state factory constructor
  const TaskState.initial() : this(status: TaskStateStatus.initial);

  final TaskStateStatus status;
  final List<Task> tasks;
  final int completedCount;
  final int incompleteCount;
  final int overdueCount;
  final int dueSoonCount;
  final String? errorMessage;

  /// Total number of tasks
  int get totalCount => tasks.length;

  /// Completion percentage (0-100)
  double get completionPercentage {
    if (totalCount == 0) return 0.0;
    return (completedCount / totalCount) * 100;
  }

  /// Whether there are any tasks
  bool get hasTasks => tasks.isNotEmpty;

  /// Whether there are any overdue tasks
  bool get hasOverdueTasks => overdueCount > 0;

  /// Whether there are any tasks due soon
  bool get hasDueSoonTasks => dueSoonCount > 0;

  /// Whether the state is in loading status
  bool get isLoading => status == TaskStateStatus.loading;

  /// Whether the state is in success status
  bool get isSuccess => status == TaskStateStatus.success;

  /// Whether the state is in failure status
  bool get isFailure => status == TaskStateStatus.failure;

  /// Whether the state is in initial status
  bool get isInitial => status == TaskStateStatus.initial;

  /// Get tasks filtered by completion status
  List<Task> get completedTasks => 
      tasks.where((task) => task.isCompleted).toList();

  /// Get incomplete tasks
  List<Task> get incompleteTasks => 
      tasks.where((task) => !task.isCompleted).toList();

  /// Get overdue tasks
  List<Task> get overdueTasks => 
      tasks.where((task) => task.isOverdue).toList();

  /// Get tasks due soon
  List<Task> get dueSoonTasks => 
      tasks.where((task) => task.isDueSoon).toList();

  /// Get tasks by priority
  List<Task> getTasksByPriority(TaskPriority priority) =>
      tasks.where((task) => task.priority == priority).toList();

  /// Creates a copy of this state with the given fields replaced with new values
  TaskState copyWith({
    TaskStateStatus? status,
    List<Task>? tasks,
    int? completedCount,
    int? incompleteCount,
    int? overdueCount,
    int? dueSoonCount,
    String? errorMessage,
  }) {
    return TaskState(
      status: status ?? this.status,
      tasks: tasks ?? this.tasks,
      completedCount: completedCount ?? this.completedCount,
      incompleteCount: incompleteCount ?? this.incompleteCount,
      overdueCount: overdueCount ?? this.overdueCount,
      dueSoonCount: dueSoonCount ?? this.dueSoonCount,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        tasks,
        completedCount,
        incompleteCount,
        overdueCount,
        dueSoonCount,
        errorMessage,
      ];

  @override
  String toString() {
    return 'TaskState(status: $status, tasksCount: ${tasks.length}, '
        'completed: $completedCount, incomplete: $incompleteCount, '
        'overdue: $overdueCount, dueSoon: $dueSoonCount, error: $errorMessage)';
  }
}