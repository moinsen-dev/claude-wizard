import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:{{project_name}}/application/blocs/task_bloc/task_bloc.dart';
import 'package:{{project_name}}/domain/entities/task.dart';
import 'package:{{project_name}}/domain/usecases/get_all_tasks.dart';
import 'package:{{project_name}}/domain/usecases/manage_task.dart';

/// Mock classes for testing
class MockGetAllTasks extends Mock implements GetAllTasks {}
class MockManageTask extends Mock implements ManageTask {}

void main() {
  group('TaskBloc', () {
    late MockGetAllTasks mockGetAllTasks;
    late MockManageTask mockManageTask;
    late TaskBloc taskBloc;

    // Sample test data
    final sampleTasks = [
      Task(
        id: '1',
        title: 'Test Task 1',
        description: 'Test Description 1',
        isCompleted: false,
        priority: TaskPriority.medium,
        createdAt: DateTime(2024, 1, 1),
      ),
      Task(
        id: '2',
        title: 'Test Task 2',
        description: 'Test Description 2',
        isCompleted: true,
        priority: TaskPriority.high,
        createdAt: DateTime(2024, 1, 2),
      ),
    ];

    final getAllTasksResult = GetAllTasksResult(
      tasks: sampleTasks,
      completedCount: 1,
      incompleteCount: 1,
      overdueCount: 0,
      dueSoonCount: 0,
    );

    setUp(() {
      mockGetAllTasks = MockGetAllTasks();
      mockManageTask = MockManageTask();
      taskBloc = TaskBloc(
        getAllTasks: mockGetAllTasks,
        manageTask: mockManageTask,
      );
    });

    tearDown(() {
      taskBloc.close();
    });

    test('initial state is TaskState.initial', () {
      expect(taskBloc.state, equals(const TaskState.initial()));
    });

    group('TaskLoadRequested', () {
      blocTest<TaskBloc, TaskState>(
        'emits [loading, success] when loading tasks succeeds',
        build: () {
          when(() => mockGetAllTasks()).thenAnswer((_) async => getAllTasksResult);
          return taskBloc;
        },
        act: (bloc) => bloc.add(const TaskLoadRequested()),
        expect: () => [
          const TaskState(status: TaskStateStatus.loading),
          TaskState(
            status: TaskStateStatus.success,
            tasks: sampleTasks,
            completedCount: 1,
            incompleteCount: 1,
            overdueCount: 0,
            dueSoonCount: 0,
          ),
        ],
        verify: (_) {
          verify(() => mockGetAllTasks()).called(1);
        },
      );

      blocTest<TaskBloc, TaskState>(
        'emits [loading, failure] when loading tasks fails',
        build: () {
          when(() => mockGetAllTasks()).thenThrow(const GetAllTasksFailure('Error'));
          return taskBloc;
        },
        act: (bloc) => bloc.add(const TaskLoadRequested()),
        expect: () => [
          const TaskState(status: TaskStateStatus.loading),
          const TaskState(
            status: TaskStateStatus.failure,
            errorMessage: 'GetAllTasksFailure: Error',
          ),
        ],
        verify: (_) {
          verify(() => mockGetAllTasks()).called(1);
        },
      );
    });

    group('TaskCreated', () {
      final newTask = Task(
        id: '3',
        title: 'New Task',
        description: 'New Description',
        isCompleted: false,
        priority: TaskPriority.low,
        createdAt: DateTime(2024, 1, 3),
      );

      blocTest<TaskBloc, TaskState>(
        'creates task and reloads tasks when successful',
        build: () {
          when(
            () => mockManageTask.createTask(
              title: any(named: 'title'),
              description: any(named: 'description'),
              priority: any(named: 'priority'),
              dueDate: any(named: 'dueDate'),
            ),
          ).thenAnswer((_) async => newTask);
          
          when(() => mockGetAllTasks()).thenAnswer((_) async => getAllTasksResult);
          return taskBloc;
        },
        act: (bloc) => bloc.add(
          const TaskCreated(
            title: 'New Task',
            description: 'New Description',
            priority: TaskPriority.low,
          ),
        ),
        expect: () => [
          const TaskState(status: TaskStateStatus.loading),
          TaskState(
            status: TaskStateStatus.success,
            tasks: sampleTasks,
            completedCount: 1,
            incompleteCount: 1,
            overdueCount: 0,
            dueSoonCount: 0,
          ),
        ],
        verify: (_) {
          verify(
            () => mockManageTask.createTask(
              title: 'New Task',
              description: 'New Description',
              priority: TaskPriority.low,
              dueDate: null,
            ),
          ).called(1);
          verify(() => mockGetAllTasks()).called(1);
        },
      );

      blocTest<TaskBloc, TaskState>(
        'emits failure when task creation fails',
        build: () {
          when(
            () => mockManageTask.createTask(
              title: any(named: 'title'),
              description: any(named: 'description'),
              priority: any(named: 'priority'),
              dueDate: any(named: 'dueDate'),
            ),
          ).thenThrow(const ManageTaskFailure('Creation failed'));
          return taskBloc;
        },
        seed: () => const TaskState(status: TaskStateStatus.success),
        act: (bloc) => bloc.add(
          const TaskCreated(
            title: 'New Task',
            description: 'New Description',
            priority: TaskPriority.low,
          ),
        ),
        expect: () => [
          const TaskState(
            status: TaskStateStatus.failure,
            errorMessage: 'ManageTaskFailure: Creation failed',
          ),
        ],
      );
    });

    group('TaskCompletionToggled', () {
      final toggledTask = sampleTasks[0].markCompleted();

      blocTest<TaskBloc, TaskState>(
        'toggles task completion and reloads tasks',
        build: () {
          when(() => mockManageTask.toggleTaskCompletion('1'))
              .thenAnswer((_) async => toggledTask);
          when(() => mockGetAllTasks()).thenAnswer((_) async => getAllTasksResult);
          return taskBloc;
        },
        act: (bloc) => bloc.add(const TaskCompletionToggled('1')),
        expect: () => [
          const TaskState(status: TaskStateStatus.loading),
          TaskState(
            status: TaskStateStatus.success,
            tasks: sampleTasks,
            completedCount: 1,
            incompleteCount: 1,
            overdueCount: 0,
            dueSoonCount: 0,
          ),
        ],
        verify: (_) {
          verify(() => mockManageTask.toggleTaskCompletion('1')).called(1);
          verify(() => mockGetAllTasks()).called(1);
        },
      );
    });

    group('TaskDeleted', () {
      blocTest<TaskBloc, TaskState>(
        'deletes task and reloads tasks',
        build: () {
          when(() => mockManageTask.deleteTask('1')).thenAnswer((_) async {});
          when(() => mockGetAllTasks()).thenAnswer((_) async => getAllTasksResult);
          return taskBloc;
        },
        act: (bloc) => bloc.add(const TaskDeleted('1')),
        expect: () => [
          const TaskState(status: TaskStateStatus.loading),
          TaskState(
            status: TaskStateStatus.success,
            tasks: sampleTasks,
            completedCount: 1,
            incompleteCount: 1,
            overdueCount: 0,
            dueSoonCount: 0,
          ),
        ],
        verify: (_) {
          verify(() => mockManageTask.deleteTask('1')).called(1);
          verify(() => mockGetAllTasks()).called(1);
        },
      );
    });

    group('TasksCleared', () {
      blocTest<TaskBloc, TaskState>(
        'clears all tasks from state',
        build: () => taskBloc,
        seed: () => TaskState(
          status: TaskStateStatus.success,
          tasks: sampleTasks,
          completedCount: 1,
          incompleteCount: 1,
          overdueCount: 0,
          dueSoonCount: 0,
        ),
        act: (bloc) => bloc.add(const TasksCleared()),
        expect: () => [
          const TaskState(
            status: TaskStateStatus.success,
            tasks: [],
            completedCount: 0,
            incompleteCount: 0,
            overdueCount: 0,
            dueSoonCount: 0,
          ),
        ],
      );
    });
  });
}