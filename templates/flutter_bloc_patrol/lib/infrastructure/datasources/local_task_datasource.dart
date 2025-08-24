import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/task.dart';

/// Local data source for task persistence using SharedPreferences.
/// 
/// This class handles the serialization and deserialization of tasks
/// to/from local storage, following clean architecture principles by
/// implementing the data source pattern.
class LocalTaskDataSource {
  const LocalTaskDataSource();

  static const String _tasksKey = 'tasks';

  /// Retrieves all tasks from local storage
  Future<List<Task>> getAllTasks() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final tasksJson = prefs.getString(_tasksKey);
      
      if (tasksJson == null || tasksJson.isEmpty) {
        return [];
      }

      final List<dynamic> taskList = json.decode(tasksJson);
      return taskList.map((json) => _taskFromJson(json)).toList();
    } catch (e) {
      throw LocalDataSourceException('Failed to load tasks: ${e.toString()}');
    }
  }

  /// Saves a list of tasks to local storage
  Future<void> saveTasks(List<Task> tasks) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final tasksJson = json.encode(tasks.map((task) => _taskToJson(task)).toList());
      await prefs.setString(_tasksKey, tasksJson);
    } catch (e) {
      throw LocalDataSourceException('Failed to save tasks: ${e.toString()}');
    }
  }

  /// Saves a single task to local storage
  Future<void> saveTask(Task task) async {
    try {
      final tasks = await getAllTasks();
      
      // Remove existing task with same ID if it exists
      tasks.removeWhere((existingTask) => existingTask.id == task.id);
      
      // Add the new/updated task
      tasks.add(task);
      
      await saveTasks(tasks);
    } catch (e) {
      throw LocalDataSourceException('Failed to save task: ${e.toString()}');
    }
  }

  /// Deletes a task from local storage
  Future<void> deleteTask(String taskId) async {
    try {
      final tasks = await getAllTasks();
      tasks.removeWhere((task) => task.id == taskId);
      await saveTasks(tasks);
    } catch (e) {
      throw LocalDataSourceException('Failed to delete task: ${e.toString()}');
    }
  }

  /// Gets a specific task by ID
  Future<Task?> getTaskById(String taskId) async {
    try {
      final tasks = await getAllTasks();
      for (final task in tasks) {
        if (task.id == taskId) {
          return task;
        }
      }
      return null;
    } catch (e) {
      throw LocalDataSourceException('Failed to get task: ${e.toString()}');
    }
  }

  /// Clears all tasks from local storage
  Future<void> clearAllTasks() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tasksKey);
    } catch (e) {
      throw LocalDataSourceException('Failed to clear tasks: ${e.toString()}');
    }
  }

  /// Converts a Task entity to JSON map
  Map<String, dynamic> _taskToJson(Task task) {
    return {
      'id': task.id,
      'title': task.title,
      'description': task.description,
      'isCompleted': task.isCompleted,
      'priority': task.priority.value,
      'createdAt': task.createdAt.toIso8601String(),
      'completedAt': task.completedAt?.toIso8601String(),
      'dueDate': task.dueDate?.toIso8601String(),
    };
  }

  /// Converts a JSON map to Task entity
  Task _taskFromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      isCompleted: json['isCompleted'] as bool,
      priority: TaskPriority.fromValue(json['priority'] as int),
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : null,
    );
  }
}

/// Exception thrown by local data source operations
class LocalDataSourceException implements Exception {
  const LocalDataSourceException(this.message);

  final String message;

  @override
  String toString() => 'LocalDataSourceException: $message';
}