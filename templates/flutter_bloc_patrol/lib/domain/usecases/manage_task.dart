import '../entities/task.dart';
import '../repositories/task_repository.dart';

/// Use case for managing task operations (create, update, delete, toggle completion).
/// 
/// This use case demonstrates the single responsibility principle by handling
/// all task management operations while maintaining business logic validation.
class ManageTask {
  const ManageTask(this._taskRepository);

  final TaskRepository _taskRepository;

  /// Creates a new task with validation
  /// 
  /// Throws [ManageTaskFailure] if validation fails or operation fails.
  Future<Task> createTask({
    required String title,
    required String description,
    required TaskPriority priority,
    DateTime? dueDate,
  }) async {
    try {
      // Business validation
      if (title.trim().isEmpty) {
        throw const ManageTaskFailure('Task title cannot be empty');
      }

      if (description.trim().isEmpty) {
        throw const ManageTaskFailure('Task description cannot be empty');
      }

      if (dueDate != null && dueDate.isBefore(DateTime.now())) {
        throw const ManageTaskFailure('Due date cannot be in the past');
      }

      final task = Task(
        id: _generateTaskId(),
        title: title.trim(),
        description: description.trim(),
        isCompleted: false,
        priority: priority,
        createdAt: DateTime.now(),
        dueDate: dueDate,
      );

      return await _taskRepository.createTask(task);
    } catch (e) {
      if (e is ManageTaskFailure) rethrow;
      throw ManageTaskFailure('Failed to create task: ${e.toString()}');
    }
  }

  /// Updates an existing task with validation
  /// 
  /// Throws [ManageTaskFailure] if validation fails or operation fails.
  Future<Task> updateTask({
    required String taskId,
    String? title,
    String? description,
    TaskPriority? priority,
    DateTime? dueDate,
  }) async {
    try {
      final existingTask = await _taskRepository.getTaskById(taskId);
      if (existingTask == null) {
        throw const ManageTaskFailure('Task not found');
      }

      // Business validation
      if (title != null && title.trim().isEmpty) {
        throw const ManageTaskFailure('Task title cannot be empty');
      }

      if (description != null && description.trim().isEmpty) {
        throw const ManageTaskFailure('Task description cannot be empty');
      }

      if (dueDate != null && dueDate.isBefore(DateTime.now()) && !existingTask.isCompleted) {
        throw const ManageTaskFailure('Due date cannot be in the past for incomplete tasks');
      }

      final updatedTask = existingTask.copyWith(
        title: title?.trim(),
        description: description?.trim(),
        priority: priority,
        dueDate: dueDate,
      );

      return await _taskRepository.updateTask(updatedTask);
    } catch (e) {
      if (e is ManageTaskFailure) rethrow;
      throw ManageTaskFailure('Failed to update task: ${e.toString()}');
    }
  }

  /// Toggles task completion status
  /// 
  /// Throws [ManageTaskFailure] if the operation fails.
  Future<Task> toggleTaskCompletion(String taskId) async {
    try {
      final task = await _taskRepository.getTaskById(taskId);
      if (task == null) {
        throw const ManageTaskFailure('Task not found');
      }

      if (task.isCompleted) {
        return await _taskRepository.markTaskIncomplete(taskId);
      } else {
        return await _taskRepository.markTaskCompleted(taskId);
      }
    } catch (e) {
      if (e is ManageTaskFailure) rethrow;
      throw ManageTaskFailure('Failed to toggle task completion: ${e.toString()}');
    }
  }

  /// Deletes a task with confirmation
  /// 
  /// Throws [ManageTaskFailure] if the operation fails.
  Future<void> deleteTask(String taskId) async {
    try {
      final task = await _taskRepository.getTaskById(taskId);
      if (task == null) {
        throw const ManageTaskFailure('Task not found');
      }

      await _taskRepository.deleteTask(taskId);
    } catch (e) {
      if (e is ManageTaskFailure) rethrow;
      throw ManageTaskFailure('Failed to delete task: ${e.toString()}');
    }
  }

  /// Generates a unique task ID
  String _generateTaskId() {
    return 'task_${DateTime.now().millisecondsSinceEpoch}';
  }
}

/// Exception thrown when ManageTask use case fails
class ManageTaskFailure implements Exception {
  const ManageTaskFailure(this.message);

  final String message;

  @override
  String toString() => 'ManageTaskFailure: $message';
}