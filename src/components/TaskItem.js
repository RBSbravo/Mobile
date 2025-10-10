// TaskItem.js
// This component renders a single task card for the task list in TasksScreen. It displays task details, status, priority, due date, and assignee avatar/initials. It is memoized for performance and expects props: { item, onPress }.
import React from 'react';
import { View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getStatusColor, getPriorityColor, formatDate } from '../utils/taskUtils';

const TaskItem = React.memo(({ item, onPress }) => {
  const paperTheme = useTheme();

  return (
    <Card
      style={[
        {
          backgroundColor: paperTheme.colors.surface,
          borderLeftWidth: 5,
          borderLeftColor: getStatusColor(item.status, paperTheme),
          marginBottom: 16,
          shadowColor: paperTheme.colors.primary,
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
        paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }
      ]}
      onPress={() => onPress(item)}
      mode="elevated"
    >
      <Card.Content style={{ paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {/* Assignee avatar/initials if available */}
          {item.assignee && (
            <View style={{
              width: 32, height: 32, borderRadius: 16, backgroundColor: paperTheme.colors.primary + '33',
              alignItems: 'center', justifyContent: 'center', marginRight: 10
            }}>
              <Text style={{ color: paperTheme.colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                {item.assignee.name ? item.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <Text style={{ color: paperTheme.colors.text, flex: 1, fontSize: 16, fontWeight: '600', marginRight: 8 }} numberOfLines={1}>{item.title}</Text>
        </View>
        {/* Chips row, matching details screen */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
          <Chip
            style={{ backgroundColor: getStatusColor(item.status, paperTheme), marginRight: 8 }}
            textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {(item.status || '').replace('_', ' ')}
          </Chip>
          <Chip
            style={{ backgroundColor: getPriorityColor(item.priority, paperTheme), marginRight: 8 }}
            textStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item.priority}
          </Chip>
        </View>
        <Text style={{ fontSize: 14, color: paperTheme.colors.textSecondary, marginBottom: 6 }} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialIcons name="schedule" size={16} color={paperTheme.colors.textSecondary} style={{ marginRight: 2 }} />
          {/* Due date badge: red if overdue, orange if due soon, gray otherwise */}
          <Text style={{
            color:
              new Date(item.dueDate) < new Date() ? paperTheme.colors.error :
              (new Date(item.dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000 ? paperTheme.colors.warning : paperTheme.colors.textSecondary),
            fontWeight: new Date(item.dueDate) < new Date() ? 'bold' : 'normal',
            marginRight: 12
          }}>
            Due: {formatDate(item.dueDate)}
          </Text>
          {item.category && (
            <>
              <MaterialIcons name="category" size={16} color={paperTheme.colors.textSecondary} style={{ marginRight: 2 }} />
              <Text style={{ fontSize: 12, color: paperTheme.colors.textSecondary, marginLeft: 4 }}>{item.category}</Text>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );
});

export default TaskItem; 