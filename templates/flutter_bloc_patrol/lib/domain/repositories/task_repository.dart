import '../entities/task.dart';

/// Abstract repository interface for task-related operations.
/// 
/// This interface defines the contract for task data operations following
/// clean architecture principles and the repository pattern.
abstract class TaskRepository {
  /// Retrieves all tasks
  /// 
  /// Returns an empty list if no tasks are found.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<List<Task>> getAllTasks();

  /// Retrieves a task by ID
  /// 
  /// Returns null if the task is not found.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<Task?> getTaskById(String taskId);

  /// Retrieves tasks filtered by completion status
  /// 
  /// Returns an empty list if no tasks match the filter.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<List<Task>> getTasksByCompletionStatus(bool isCompleted);

  /// Retrieves tasks filtered by priority
  /// 
  /// Returns an empty list if no tasks match the filter.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<List<Task>> getTasksByPriority(TaskPriority priority);

  /// Retrieves overdue tasks
  /// 
  /// Returns an empty list if no overdue tasks are found.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<List<Task>> getOverdueTasks();

  /// Creates a new task
  /// 
  /// Returns the created task with assigned ID.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<Task> createTask(Task task);

  /// Updates an existing task
  /// 
  /// Throws [TaskRepositoryException] if the task doesn't exist or
  /// the operation fails.
  Future<Task> updateTask(Task task);

  /// Deletes a task
  /// 
  /// Throws [TaskRepositoryException] if the task doesn't exist or
  /// the operation fails.
  Future<void> deleteTask(String taskId);

  /// Marks a task as completed
  /// 
  /// Throws [TaskRepositoryException] if the task doesn't exist or
  /// the operation fails.
  Future<Task> markTaskCompleted(String taskId);

  /// Marks a task as incomplete
  /// 
  /// Throws [TaskRepositoryException] if the task doesn't exist or
  /// the operation fails.
  Future<Task> markTaskIncomplete(String taskId);

  /// Clears all tasks
  /// 
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<void> clearAllTasks();

  /// Searches tasks by title or description
  /// 
  /// Returns an empty list if no tasks match the query.
  /// Throws [TaskRepositoryException] if the operation fails.
  Future<List<Task>> searchTasks(String query);
}

/// Exception thrown by task repository operations
class TaskRepositoryException implements Exception {
  const TaskRepositoryException(this.message, [this.cause]);

  final String message;
  final dynamic cause;

  @override
  String toString() {
    return 'TaskRepositoryException: $message${cause != null ? ' (caused by: $cause)' : ''}';
  }
}