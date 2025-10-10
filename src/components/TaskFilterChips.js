// TaskFilterChips.js
// This component renders the filter chips row for filtering tasks by status, priority, and category. It is used in TasksScreen and receives filter state and setters as props.
import React from 'react';
import { ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

const TaskFilterChips = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  styles
}) => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    style={[styles.filterChipsContainer, { marginTop: 16, marginBottom: 20 }]}
    contentContainerStyle={styles.filterChipsContent}
  >
    <Chip
      selected={statusFilter === 'All'}
      onPress={() => setStatusFilter('All')}
      style={[styles.filterChip, styles.fixedChip]}
      textStyle={styles.fixedChipText}
      ellipsizeMode="tail"
      numberOfLines={1}
    >
      All
    </Chip>
    <Chip
      selected={statusFilter === 'Pending'}
      onPress={() => setStatusFilter('Pending')}
      style={[styles.filterChip, styles.fixedChip]}
      textStyle={styles.fixedChipText}
      ellipsizeMode="tail"
      numberOfLines={1}
    >
      Pending
    </Chip>
    <Chip
      selected={statusFilter === 'In Progress'}
      onPress={() => setStatusFilter('In Progress')}
      style={[styles.filterChip, styles.fixedChip]}
      textStyle={styles.fixedChipText}
      ellipsizeMode="tail"
      numberOfLines={1}
    >
      In Progress
    </Chip>
    <Chip
      selected={statusFilter === 'Completed'}
      onPress={() => setStatusFilter('Completed')}
      style={[styles.filterChip, styles.fixedChip]}
      textStyle={styles.fixedChipText}
      ellipsizeMode="tail"
      numberOfLines={1}
    >
      Completed
    </Chip>
    <Chip
      selected={statusFilter === 'Declined'}
      onPress={() => setStatusFilter('Declined')}
      style={[styles.filterChip, styles.fixedChip]}
      textStyle={styles.fixedChipText}
      ellipsizeMode="tail"
      numberOfLines={1}
    >
      Declined
    </Chip>
    {/* Add more chips for priority and category if needed */}
  </ScrollView>
);

export default TaskFilterChips; 