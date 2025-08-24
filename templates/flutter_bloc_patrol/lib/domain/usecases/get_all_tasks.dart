import '../entities/task.dart';
import '../repositories/task_repository.dart';

/// Use case for retrieving all tasks.
/// 
/// This use case encapsulates the business logic for fetching all tasks
/// and demonstrates the clean architecture pattern where use cases
/// orchestrate the flow of data between repositories and presentation layers.
class GetAllTasks {
  const GetAllTasks(this._taskRepository);

  final TaskRepository _taskRepository;

  /// Executes the use case to get all tasks.
  /// 
  /// Returns a [GetAllTasksResult] containing the tasks and metadata.
  /// Throws [GetAllTasksFailure] if the operation fails.
  Future<GetAllTasksResult> call() async {
    try {
      final tasks = await _taskRepository.getAllTasks();
      
      // Business logic: categorize tasks
      final completedTasks = tasks.where((task) => task.isCompleted).toList();
      final incompleteTasks = tasks.where((task) => !task.isCompleted).toList();
      final overdueTasks = tasks.where((task) => task.isOverdue).toList();
      final dueSoonTasks = tasks.where((task) => task.isDueSoon).toList();

      return GetAllTasksResult(
        tasks: tasks,
        completedCount: completedTasks.length,
        incompleteCount: incompleteTasks.length,
        overdueCount: overdueTasks.length,
        dueSoonCount: dueSoonTasks.length,
      );
    } catch (e) {
      throw GetAllTasksFailure('Failed to retrieve tasks: ${e.toString()}');
    }
  }
}

/// Result object for the GetAllTasks use case
class GetAllTasksResult {
  const GetAllTasksResult({
    required this.tasks,
    required this.completedCount,
    required this.incompleteCount,
    required this.overdueCount,
    required this.dueSoonCount,
  });

  final List<Task> tasks;
  final int completedCount;
  final int incompleteCount;
  final int overdueCount;
  final int dueSoonCount;

  /// Total number of tasks
  int get totalCount => tasks.length;

  /// Completion percentage (0-100)
  double get completionPercentage {
    if (totalCount == 0) return 0.0;
    return (completedCount / totalCount) * 100;
  }

  /// Whether there are any overdue tasks
  bool get hasOverdueTasks => overdueCount > 0;

  /// Whether there are any tasks due soon
  bool get hasDueSoonTasks => dueSoonCount > 0;
}

/// Exception thrown when GetAllTasks use case fails
class GetAllTasksFailure implements Exception {
  const GetAllTasksFailure(this.message);

  final String message;

  @override
  String toString() => 'GetAllTasksFailure: $message';
}