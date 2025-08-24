import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../domain/entities/task.dart';
import '../../../domain/usecases/get_all_tasks.dart';
import '../../../domain/usecases/manage_task.dart';

part 'task_event.dart';
part 'task_state.dart';

/// Bloc for managing task-related state and events.
/// 
/// This bloc follows clean architecture principles by using use cases
/// to interact with the domain layer, ensuring separation of concerns
/// and testability without code generation.
class TaskBloc extends Bloc<TaskEvent, TaskState> {
  TaskBloc({
    required GetAllTasks getAllTasks,
    required ManageTask manageTask,
  })  : _getAllTasks = getAllTasks,
        _manageTask = manageTask,
        super(const TaskState.initial()) {
    on<TaskLoadRequested>(_onTaskLoadRequested);
    on<TaskCreated>(_onTaskCreated);
    on<TaskUpdated>(_onTaskUpdated);
    on<TaskDeleted>(_onTaskDeleted);
    on<TaskCompletionToggled>(_onTaskCompletionToggled);
    on<TasksCleared>(_onTasksCleared);
  }

  final GetAllTasks _getAllTasks;
  final ManageTask _manageTask;

  /// Handles loading tasks from the repository
  Future<void> _onTaskLoadRequested(
    TaskLoadRequested event,
    Emitter<TaskState> emit,
  ) async {
    emit(state.copyWith(status: TaskStateStatus.loading));

    try {
      final result = await _getAllTasks();
      
      emit(state.copyWith(
        status: TaskStateStatus.success,
        tasks: result.tasks,
        completedCount: result.completedCount,
        incompleteCount: result.incompleteCount,
        overdueCount: result.overdueCount,
        dueSoonCount: result.dueSoonCount,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: TaskStateStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  /// Handles creating a new task
  Future<void> _onTaskCreated(
    TaskCreated event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await _manageTask.createTask(
        title: event.title,
        description: event.description,
        priority: event.priority,
        dueDate: event.dueDate,
      );

      // Reload tasks to get updated list
      add(const TaskLoadRequested());
    } catch (e) {
      emit(state.copyWith(
        status: TaskStateStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  /// Handles updating an existing task
  Future<void> _onTaskUpdated(
    TaskUpdated event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await _manageTask.updateTask(
        taskId: event.taskId,
        title: event.title,
        description: event.description,
        priority: event.priority,
        dueDate: event.dueDate,
      );

      // Reload tasks to get updated list
      add(const TaskLoadRequested());
    } catch (e) {
      emit(state.copyWith(
        status: TaskStateStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  /// Handles deleting a task
  Future<void> _onTaskDeleted(
    TaskDeleted event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await _manageTask.deleteTask(event.taskId);

      // Reload tasks to get updated list
      add(const TaskLoadRequested());
    } catch (e) {
      emit(state.copyWith(
        status: TaskStateStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  /// Handles toggling task completion status
  Future<void> _onTaskCompletionToggled(
    TaskCompletionToggled event,
    Emitter<TaskState> emit,
  ) async {
    try {
      await _manageTask.toggleTaskCompletion(event.taskId);

      // Reload tasks to get updated list
      add(const TaskLoadRequested());
    } catch (e) {
      emit(state.copyWith(
        status: TaskStateStatus.failure,
        errorMessage: e.toString(),
      ));
    }
  }

  /// Handles clearing all tasks
  Future<void> _onTasksCleared(
    TasksCleared event,
    Emitter<TaskState> emit,
  ) async {
    emit(state.copyWith(
      status: TaskStateStatus.success,
      tasks: const [],
      completedCount: 0,
      incompleteCount: 0,
      overdueCount: 0,
      dueSoonCount: 0,
    ));
  }
}