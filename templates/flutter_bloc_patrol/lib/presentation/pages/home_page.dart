import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../application/blocs/task_bloc/task_bloc.dart';
import '../../domain/entities/task.dart';
import '../router/app_router.dart';
import '../widgets/responsive_layout.dart';
import '../widgets/task_list_widget.dart';
import '../widgets/task_stats_widget.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/error_widget.dart';
import '../widgets/loading_widget.dart';

/// Home page that displays the main task management interface.
/// 
/// This page follows responsive design principles and adapts to different
/// screen sizes and orientations. It serves as the main hub for task
/// management functionality.
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final ScrollController _scrollController = ScrollController();
  TaskFilter _currentFilter = TaskFilter.all;

  @override
  void initState() {
    super.initState();
    // Load tasks when the page initializes
    context.read<TaskBloc>().add(const TaskLoadRequested());
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ResponsiveLayout(
      mobile: _buildMobileLayout(),
      tablet: _buildTabletLayout(),
      desktop: _buildDesktopLayout(),
    );
  }

  Widget _buildMobileLayout() {
    return Scaffold(
      appBar: _buildAppBar(),
      body: _buildBody(),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildTabletLayout() {
    return Scaffold(
      appBar: _buildAppBar(),
      body: Row(
        children: [
          // Side panel for stats
          SizedBox(
            width: 300,
            child: Card(
              margin: const EdgeInsets.all(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Overview',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    BlocBuilder<TaskBloc, TaskState>(
                      builder: (context, state) {
                        return TaskStatsWidget(
                          totalTasks: state.totalCount,
                          completedTasks: state.completedCount,
                          incompleteTasks: state.incompleteCount,
                          overdueTasks: state.overdueCount,
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Main content
          Expanded(
            child: _buildBody(),
          ),
        ],
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildDesktopLayout() {
    return Scaffold(
      appBar: _buildAppBar(),
      body: Row(
        children: [
          // Navigation sidebar
          SizedBox(
            width: 280,
            child: _buildSidebar(),
          ),
          // Main content area
          Expanded(
            flex: 2,
            child: _buildBody(),
          ),
          // Stats panel
          SizedBox(
            width: 320,
            child: _buildStatsPanel(),
          ),
        ],
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text('{{project-name}}'),
      actions: [
        IconButton(
          icon: const Icon(Icons.settings),
          onPressed: () => context.goSettings(),
          tooltip: 'Settings',
        ),
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () {
            context.read<TaskBloc>().add(const TaskLoadRequested());
          },
          tooltip: 'Refresh',
        ),
      ],
    );
  }

  Widget _buildBody() {
    return Column(
      children: [
        // Filter chips
        _buildFilterChips(),
        // Task list
        Expanded(
          child: BlocBuilder<TaskBloc, TaskState>(
            builder: (context, state) {
              if (state.isLoading) {
                return const LoadingWidget();
              }

              if (state.isFailure) {
                return AppErrorWidget(
                  message: state.errorMessage ?? 'An error occurred',
                  onRetry: () {
                    context.read<TaskBloc>().add(const TaskLoadRequested());
                  },
                );
              }

              if (!state.hasTasks) {
                return const EmptyStateWidget();
              }

              final filteredTasks = _filterTasks(state.tasks);

              if (filteredTasks.isEmpty) {
                return EmptyStateWidget(
                  title: 'No tasks found',
                  message: 'No tasks match the current filter',
                  showCreateButton: false,
                );
              }

              return TaskListWidget(
                tasks: filteredTasks,
                scrollController: _scrollController,
                onTaskTap: (task) => context.goTaskDetail(task.id),
                onTaskCompletionChanged: (task) {
                  context
                      .read<TaskBloc>()
                      .add(TaskCompletionToggled(task.id));
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: TaskFilter.values.map((filter) {
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(_getFilterLabel(filter)),
              selected: _currentFilter == filter,
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    _currentFilter = filter;
                  });
                }
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          right: BorderSide(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
          ),
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 16),
          // Quick actions
          ListTile(
            leading: const Icon(Icons.add),
            title: const Text('Create Task'),
            onTap: () => context.goCreateTask(),
          ),
          ListTile(
            leading: const Icon(Icons.list),
            title: const Text('All Tasks'),
            selected: _currentFilter == TaskFilter.all,
            onTap: () => setState(() => _currentFilter = TaskFilter.all),
          ),
          ListTile(
            leading: const Icon(Icons.pending_actions),
            title: const Text('Active'),
            selected: _currentFilter == TaskFilter.active,
            onTap: () => setState(() => _currentFilter = TaskFilter.active),
          ),
          ListTile(
            leading: const Icon(Icons.check_circle),
            title: const Text('Completed'),
            selected: _currentFilter == TaskFilter.completed,
            onTap: () => setState(() => _currentFilter = TaskFilter.completed),
          ),
          ListTile(
            leading: const Icon(Icons.warning),
            title: const Text('Overdue'),
            selected: _currentFilter == TaskFilter.overdue,
            onTap: () => setState(() => _currentFilter = TaskFilter.overdue),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsPanel() {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
          ),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Statistics',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            BlocBuilder<TaskBloc, TaskState>(
              builder: (context, state) {
                return TaskStatsWidget(
                  totalTasks: state.totalCount,
                  completedTasks: state.completedCount,
                  incompleteTasks: state.incompleteCount,
                  overdueTasks: state.overdueCount,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton(
      onPressed: () => context.goCreateTask(),
      tooltip: 'Create Task',
      child: const Icon(Icons.add),
    );
  }

  List<Task> _filterTasks(List<Task> tasks) {
    switch (_currentFilter) {
      case TaskFilter.all:
        return tasks;
      case TaskFilter.active:
        return tasks.where((task) => !task.isCompleted).toList();
      case TaskFilter.completed:
        return tasks.where((task) => task.isCompleted).toList();
      case TaskFilter.overdue:
        return tasks.where((task) => task.isOverdue).toList();
    }
  }

  String _getFilterLabel(TaskFilter filter) {
    switch (filter) {
      case TaskFilter.all:
        return 'All';
      case TaskFilter.active:
        return 'Active';
      case TaskFilter.completed:
        return 'Completed';
      case TaskFilter.overdue:
        return 'Overdue';
    }
  }
}

/// Enum for task filtering options
enum TaskFilter { all, active, completed, overdue }