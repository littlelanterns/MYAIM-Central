// Main Dashboard Components
export { default as MomDashboard } from './mom/MomDashboard';
export { default as TeenDashboard } from './teen/TeenDashboard';
export { default as ChildDashboard } from './child/ChildDashboard';

// Mom Dashboard Widgets
export { default as FamilyOverviewWidget } from './mom/widgets/FamilyOverviewWidget';
export { default as TaskManagementWidget } from './mom/widgets/TaskManagementWidget';
export { default as ChildProgressWidget } from './mom/widgets/ChildProgressWidget';
export { default as ScheduleWidget } from './mom/widgets/ScheduleWidget';
export { default as NotificationsWidget } from './mom/widgets/NotificationsWidget';
export { default as QuickActionsWidget } from './mom/widgets/QuickActionsWidget';
export { default as VictoryRecorderWidget } from './mom/widgets/VictoryRecorderWidget';

// Mom Dashboard Layouts
export { default as DashboardGrid } from './mom/layouts/DashboardGrid';
export { default as WidgetContainer } from './mom/layouts/WidgetContainer';

// Teen Dashboard Widgets
export { default as TaskOverviewWidget } from './teen/widgets/TaskOverviewWidget';
export { default as TaskProgressWidget } from './teen/widgets/TaskProgressWidget';
export { default as AchievementWidget } from './teen/widgets/AchievementWidget';
export { default as CalendarWidget } from './teen/widgets/CalendarWidget';
export { default as RewardsWidget } from './teen/widgets/RewardsWidget';
export { default as TeenVictoryRecorderWidget } from './teen/widgets/VictoryRecorderWidget';

// Teen Dashboard Layouts
export { default as TeenDashboardGrid } from './teen/layouts/TeenDashboardGrid';
export { default as TeenWidgetContainer } from './teen/layouts/TeenWidgetContainer';

// Child Dashboard Widgets
export { default as MyTasksWidget } from './child/widgets/MyTasksWidget';
export { default as TaskImageWidget } from './child/widgets/TaskImageWidget';
export { default as SuccessAnimationWidget } from './child/widgets/SuccessAnimationWidget';
export { default as RewardStarsWidget } from './child/widgets/RewardStarsWidget';
export { default as ChildVictoryRecorderWidget } from './child/widgets/VictoryRecorderWidget';
export { default as FamilyPhotosWidget } from './child/widgets/FamilyPhotosWidget';
export { default as FunActivitiesWidget } from './child/widgets/FunActivitiesWidget';

// Child Dashboard Components
export { default as ImageTaskCard } from './child/components/ImageTaskCard';
export { default as CustomImageUploader } from './child/components/CustomImageUploader';
export { default as SuccessAnimation } from './child/components/SuccessAnimation';
export { default as StarReward } from './child/components/StarReward';
export { default as SimpleTaskButton } from './child/components/SimpleTaskButton';

// Child Dashboard Layouts
export { default as ChildDashboardGrid } from './child/layouts/ChildDashboardGrid';
export { default as ChildWidgetContainer } from './child/layouts/ChildWidgetContainer';

// Shared Dashboard Components
export { default as DashboardProvider } from './shared/DashboardProvider';
export { default as WidgetWrapper } from './shared/WidgetWrapper';
export { default as WidgetSelector } from './shared/WidgetSelector';
export { default as DragDropProvider } from './shared/DragDropProvider';