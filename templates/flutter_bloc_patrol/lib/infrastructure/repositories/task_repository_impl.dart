import '../../domain/entities/task.dart';
import '../../domain/repositories/task_repository.dart';
import '../datasources/local_task_datasource.dart';

/// Implementation of TaskRepository that uses local data sources.
/// 
/// This class adapts the data source layer to the domain layer,
/// handling any necessary data transformation and error handling
/// while maintaining the repository contract.
class TaskRepositoryImpl implements TaskRepository {
  const TaskRepositoryImpl({
    required LocalTaskDataSource localDataSource,
  }) : _localDataSource = localDataSource;

  final LocalTaskDataSource _localDataSource;

  @override
  Future<List<Task>> getAllTasks() async {
    try {
      return await _localDataSource.getAllTasks();
    } catch (e) {
      throw TaskRepositoryException('Failed to get all tasks', e);
    }
  }

  @override
  Future<Task?> getTaskById(String taskId) async {
    try {
      return await _localDataSource.getTaskById(taskId);
    } catch (e) {
      throw TaskRepositoryException('Failed to get task by ID', e);
    }
  }

  @override
  Future<List<Task>> getTasksByCompletionStatus(bool isCompleted) async {
    try {
      final allTasks = await _localDataSource.getAllTasks();
      return allTasks.where((task) => task.isCompleted == isCompleted).toList();
    } catch (e) {
      throw TaskRepositoryException('Failed to get tasks by completion status', e);
    }
  }

  @override
  Future<List<Task>> getTasksByPriority(TaskPriority priority) async {
    try {
      final allTasks = await _localDataSource.getAllTasks();
      return allTasks.where((task) => task.priority == priority).toList();
    } catch (e) {
      throw TaskRepositoryException('Failed to get tasks by priority', e);
    }
  }

  @override
  Future<List<Task>> getOverdueTasks() async {
    try {
      final allTasks = await _localDataSource.getAllTasks();
      return allTasks.where((task) => task.isOverdue).toList();
    } catch (e) {
      throw TaskRepositoryException('Failed to get overdue tasks', e);
    }
  }

  @override
  Future<Task> createTask(Task task) async {
    try {
      await _localDataSource.saveTask(task);
      return task;
    } catch (e) {
      throw TaskRepositoryException('Failed to create task', e);
    }
  }

  @override
  Future<Task> updateTask(Task task) async {
    try {
      // Check if task exists
      final existingTask = await _localDataSource.getTaskById(task.id);
      if (existingTask == null) {
        throw TaskRepositoryException('Task not found for update: ${task.id}');
      }

      await _localDataSource.saveTask(task);
      return task;
    } catch (e) {
      if (e is TaskRepositoryException) rethrow;
      throw TaskRepositoryException('Failed to update task', e);
    }
  }

  @override
  Future<void> deleteTask(String taskId) async {
    try {
      // Check if task exists
      final existingTask = await _localDataSource.getTaskById(taskId);
      if (existingTask == null) {
        throw TaskRepositoryException('Task not found for deletion: $taskId');
      }

      await _localDataSource.deleteTask(taskId);
    } catch (e) {
      if (e is TaskRepositoryException) rethrow;
      throw TaskRepositoryException('Failed to delete task', e);
    }
  }

  @override
  Future<Task> markTaskCompleted(String taskId) async {
    try {
      final task = await _localDataSource.getTaskById(taskId);
      if (task == null) {
        throw TaskRepositoryException('Task not found: $taskId');
      }

      final completedTask = task.markCompleted();
      await _localDataSource.saveTask(completedTask);
      return completedTask;
    } catch (e) {
      if (e is TaskRepositoryException) rethrow;
      throw TaskRepositoryException('Failed to mark task as completed', e);
    }
  }

  @override
  Future<Task> markTaskIncomplete(String taskId) async {
    try {
      final task = await _localDataSource.getTaskById(taskId);
      if (task == null) {
        throw TaskRepositoryException('Task not found: $taskId');
      }

      final incompleteTask = task.markIncomplete();
      await _localDataSource.saveTask(incompleteTask);
      return incompleteTask;
    } catch (e) {
      if (e is TaskRepositoryException) rethrow;
      throw TaskRepositoryException('Failed to mark task as incomplete', e);
    }
  }

  @override
  Future<void> clearAllTasks() async {
    try {
      await _localDataSource.clearAllTasks();
    } catch (e) {
      throw TaskRepositoryException('Failed to clear all tasks', e);
    }
  }

  @override
  Future<List<Task>> searchTasks(String query) async {
    try {
      final allTasks = await _localDataSource.getAllTasks();
      final lowercaseQuery = query.toLowerCase();
      
      return allTasks.where((task) {
        return task.title.toLowerCase().contains(lowercaseQuery) ||
               task.description.toLowerCase().contains(lowercaseQuery);
      }).toList();
    } catch (e) {
      throw TaskRepositoryException('Failed to search tasks', e);
    }
  }
}