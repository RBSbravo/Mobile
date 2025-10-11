import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Platform, Linking, Image, Dimensions, TouchableOpacity, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { Text, Card, ProgressBar, Button, Chip, TextInput, Caption, Title, useTheme } from 'react-native-paper';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';
import FileAttachment from '../../components/FileAttachment';
import { Modal, Portal } from 'react-native-paper';
import config from '../../config/api.config';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';
import { formatDetailedDate, formatDateTime } from '../../utils/taskUtils';
import { useNavigation } from '@react-navigation/native';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

const TaskDetailScreen = ({ route }) => {
  const { taskId } = route.params;
  const paperTheme = useTheme();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();
  const { showError } = useError();
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [deleteCommentDialogVisible, setDeleteCommentDialogVisible] = useState(false);
  const navigation = useNavigation();
  const { setupTaskUpdates, setupCommentUpdates, cleanupListeners } = useRealtimeUpdates();
  // 1. Add state for remarks
  const [editRemarks, setEditRemarks] = useState('');

  const canEdit = user && task && (
    user.id === task.assignedToId ||
    user.id === task.assigned_to_id ||
    (task.assignedUser && user.id === task.assignedUser.id)
  );

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTask = await api.getTask(taskId, token);
      // Fetch attachments if not present
      let attachments = fetchedTask.attachments;
      if (!attachments) {
        try {
          const res = await fetch(`${config.BACKEND_API_URL}/files/task/${taskId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (res.ok) {
            attachments = await res.json();
          } else {
            attachments = [];
          }
        } catch (err) {
          attachments = [];
        }
      }
      setTask({ ...fetchedTask, attachments });
      const fetchedComments = await api.getTaskComments(token, taskId);
      setComments(fetchedComments);
    } catch (error) {
      showError('Failed to load task details. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  }, [taskId, token, showError]);

  // Real-time updates for task and comments
  useEffect(() => {
    const handleTaskUpdate = (updatedTask) => {
      if (updatedTask.id === taskId) {
        setTask(prev => ({ ...prev, ...updatedTask }));
      }
    };

    const handleTaskStatusChange = (data) => {
      if (data.taskId === taskId) {
        setTask(prev => ({ ...prev, status: data.status }));
      }
    };

    const handleNewComment = (comment) => {
      if (comment.taskId === taskId) {
        setComments(prev => [comment, ...prev]);
      }
    };

    const handleCommentUpdate = (comment) => {
      if (comment.taskId === taskId) {
        setComments(prev => prev.map(c => 
          c.id === comment.id ? comment : c
        ));
      }
    };

    const handleCommentDeleted = (data) => {
      if (data.taskId === taskId) {
        setComments(prev => prev.filter(c => c.id !== data.commentId));
      }
    };

    setupTaskUpdates(handleTaskUpdate, handleTaskStatusChange);
    setupCommentUpdates(handleNewComment, handleCommentUpdate, handleCommentDeleted);

    return () => {
      cleanupListeners();
    };
  }, [taskId, setupTaskUpdates, setupCommentUpdates, cleanupListeners]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const createdComment = await api.addTaskComment(token, taskId, newComment);
      setComments(prevComments => [createdComment, ...prevComments]);
      setNewComment('');
      // Upload attached files
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            await api.uploadTaskAttachment(taskId, file, token);
          } catch (err) {
            showError('Failed to upload one or more files.');
          }
        }
        setAttachedFiles([]);
      }
      // Refresh task to show new files
      await fetchTaskDetails();
    } catch (error) {
      showError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'in progress':
      case 'in_progress':
        return paperTheme.colors.primary;
      case 'completed':
        return paperTheme.colors.success;
      case 'pending':
        return paperTheme.colors.warning;
      case 'declined':
        return paperTheme.colors.error;
      default:
        return paperTheme.colors.textSecondary;
    }
  };

  const renderComment = ({ item }) => (
    <View>
      <View
        style={[
          styles.commentContainer,
          item.content && item.content.startsWith('📝 **Task Updated**') && {
            backgroundColor: '#e6f7ff',
            borderLeftWidth: 4,
            borderLeftColor: '#1890ff',
            paddingLeft: 10,
          },
        ]}
      >
        <Text style={{ fontWeight: item.content && item.content.startsWith('📝 **Task Updated**') ? 'bold' : 'normal', color: paperTheme.colors.text }}>
          {item.content}
        </Text>
        <Caption style={{ color: paperTheme.colors.textSecondary }}>
          {item.commentUser?.firstname || ''} {item.commentUser?.lastname || ''} - {formatDateTime(item.createdAt)}
        </Caption>
      </View>
      {/* Divider below each comment */}
      <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 6, marginLeft: 8, marginRight: 8 }} />
    </View>
  );

  const openEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditRemarks('');
    setEditVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editRemarks.trim()) {
      showError('Remarks are required when updating a task.');
      return;
    }
    setEditLoading(true);
    try {
      await api.updateTask(token, task.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority,
      });
      // Add remarks as a comment
      await api.addTaskComment(token, task.id, `📝 **Task Updated**\n\n${editRemarks}`);
      setEditVisible(false);
      await fetchTaskDetails();
      // Refresh comments
      const fetchedComments = await api.getTaskComments(token, task.id);
      setComments(fetchedComments);
    } catch (err) {
      showError('Failed to update task.');
    } finally {
      setEditLoading(false);
    }
  };

  // Assignee lookup (always show current user, prefer name)
  const assignedToName = user
    ? (user.name
        || (user.firstName && user.lastName && `${user.firstName} ${user.lastName}`)
        || user.firstname && user.lastname && `${user.firstname} ${user.lastname}`
        || user.username
        || user.id)
    : 'Unassigned';

  // Helper to download file with token
  const downloadFileWithToken = async (url, token, fileName) => {
    const localUri = FileSystem.cacheDirectory + fileName;
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      localUri,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    try {
      const { uri } = await downloadResumable.downloadAsync();
      return uri;
    } catch (err) {
      throw err;
    }
  };

  // Helper for secure web view with token
  async function viewFileWithTokenWeb(url, token, fileName) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      alert('Failed to view file');
      return;
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60 * 1000);
  }

  if (loading || !task) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: paperTheme.colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
      <Card 
        style={[styles.card, { backgroundColor: paperTheme.colors.surface, ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }) }]}
        mode="elevated"
      >
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title style={{ color: paperTheme.colors.text, fontWeight: 'bold', fontSize: 22, flex: 1 }}>{task.title}</Title>
            {canEdit && (
              <Button
                mode="outlined"
                icon="pencil"
                onPress={openEdit}
                style={{ marginLeft: 8 }}
              >
                Edit
              </Button>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
            <Chip style={{ backgroundColor: getStatusColor(task.status), marginRight: 8 }} textStyle={{ color: '#fff' }}>{(task.status || '').replace('_', ' ')}</Chip>
            <Chip style={{ backgroundColor: paperTheme.colors.accent, marginRight: 8 }} textStyle={{ color: '#fff' }}>{task.priority}</Chip>
          </View>
          <Text style={[styles.description, { color: paperTheme.colors.textSecondary }]}>{task.description}</Text>
          <View style={{ marginVertical: 6 }}>
            <Text style={{ color: paperTheme.colors.text }}><Text style={{ fontWeight: 'bold' }}>Assigned To:</Text> {assignedToName}</Text>
            {task.dueDate && <Text style={{ color: paperTheme.colors.text }}><Text style={{ fontWeight: 'bold' }}>Due Date:</Text> {formatDetailedDate(task.dueDate)}</Text>}
            {task.project && <Text style={{ color: paperTheme.colors.text }}><Text style={{ fontWeight: 'bold' }}>Project:</Text> {task.project}</Text>}
            {task.estimatedHours && <Text style={{ color: paperTheme.colors.text }}><Text style={{ fontWeight: 'bold' }}>Estimated Hours:</Text> {task.estimatedHours}</Text>}
          </View>
        </Card.Content>
      </Card>
      {task.relatedTicket && (
        <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface, marginTop: 12, ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }) }]} mode="elevated">
          <Card.Title title="Related Ticket" titleStyle={{ color: paperTheme.colors.text }} />
          <Card.Content>
            <Text style={{ color: paperTheme.colors.text, fontWeight: 'bold', fontSize: 16 }}>{task.relatedTicket.title}</Text>
            <Text style={{ color: paperTheme.colors.textSecondary, marginBottom: 6 }}>{task.relatedTicket.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Chip style={{ backgroundColor: getStatusColor(task.relatedTicket.status), marginRight: 8 }} textStyle={{ color: '#fff' }}>{(task.relatedTicket.status || '').replace('_', ' ')}</Chip>
              <Chip style={{ backgroundColor: paperTheme.colors.accent, marginRight: 8 }} textStyle={{ color: '#fff' }}>{task.relatedTicket.priority}</Chip>
            </View>
            {task.relatedTicket.due_date && (
              <Text style={{ color: paperTheme.colors.text }}><Text style={{ fontWeight: 'bold' }}>Due Date:</Text> {task.relatedTicket.due_date}</Text>
            )}
            {/* Ticket Attachments */}
            {Array.isArray(task.relatedTicket.attachments) && task.relatedTicket.attachments.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: paperTheme.colors.text, fontWeight: 'bold', marginBottom: 4 }}>Attachments:</Text>
                {task.relatedTicket.attachments.map(file => {
                  const url = file.url || `${config.BACKEND_API_URL}/files/${file.id}/download`;
                  return (
                    <TouchableOpacity
                      key={file.id || file.file_name}
                      onPress={() => {
                        // Try to open/download the file (reuse logic from main attachments)
                        setSelectedFile({ file, url });
                      }}
                      activeOpacity={0.7}
                      style={{ marginBottom: 4 }}
                    >
                      <Text style={{ color: paperTheme.colors.primary, textDecorationLine: 'underline' }} numberOfLines={1} ellipsizeMode="middle">
                        {file.file_name || file.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
      )}
      {/* Attachments Section */}
      <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface, ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }) }]} mode="elevated">
        <Card.Title title="Attachments" titleStyle={{ color: paperTheme.colors.text }} />
        <Card.Content>
          {task.attachments && task.attachments.length > 0 ? (
            task.attachments.map(file => {
              const url = file.url || `${config.BACKEND_API_URL}/files/${file.id}/download`;
              const ext = (file.file_name || file.name || '').split('.').pop().toLowerCase();
              const isImage = ['jpg','jpeg','png','gif','bmp','webp'].includes(ext);
              const isPdf = ext === 'pdf';
              const uploadedByCurrentUser = file.uploaded_by === user.id || file.uploader?.id === user.id;
              return (
                <View
                  key={file.id || file.file_name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                    minHeight: 40,
                    paddingRight: 8,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1, minWidth: 0 }}
                    onPress={() => setSelectedFile({ file, url, isImage, isPdf })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: paperTheme.colors.primary,
                        fontWeight: '500',
                        fontSize: 15,
                        flex: 1,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {file.file_name || file.name}
                    </Text>
                    {file.created_at && (
                      <Text
                        style={{
                          color: '#888',
                          fontSize: 11,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {new Date(file.created_at).toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {uploadedByCurrentUser && (
                    <Button
                      icon="delete"
                      mode="text"
                      textColor={paperTheme.colors.error}
                      onPress={() => {
                        setDeleteFileId(file.id);
                        setDeleteDialogVisible(true);
                      }}
                      compact
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              );
            })
          ) : (
            <Text style={{ color: paperTheme.colors.textSecondary }}>No attachments yet.</Text>
          )}
          {/* File upload */}
          <FileAttachment
            onUpload={async (file) => {
              await api.uploadTaskAttachment(taskId, file, token);
              await fetchTaskDetails(); // Refresh attachments after upload
            }}
          />
        </Card.Content>
      </Card>
      {/* File Action Modal */}
      <Portal>
        <Modal visible={!!selectedFile} onDismiss={() => setSelectedFile(null)} contentContainerStyle={{ backgroundColor: '#fff', margin: 24, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          {selectedFile && (
            <>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{selectedFile.file.file_name || selectedFile.file.name}</Text>
              {selectedFile.file.created_at && (
                <Text style={{ color: '#888', marginBottom: 12 }}>{new Date(selectedFile.file.created_at).toLocaleString()}</Text>
              )}
              {/* Download/Open button: Downloads the file with the token and opens it in the in-app FileViewerScreen. */}
              <Button
                mode="contained"
                style={{ marginBottom: 8 }}
                onPress={async () => {
                  try {
                    setLoadingPreview(true);
                    // Ensure the file name ends with the correct extension and has no extra suffixes
                    const originalName = selectedFile.file.file_name || selectedFile.file.name || 'file';
                    // Extract extension
                    const extMatch = originalName.match(/\.(docx|doc|xlsx|xls|pptx|ppt|pdf|jpg|jpeg|png|gif|bmp|webp)$/i);
                    const ext = extMatch ? extMatch[0] : '';
                    // Remove extension from base name
                    const baseName = ext ? originalName.replace(ext, '') : originalName;
                    // Sanitize base name
                    const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
                    // Final file name
                    const safeName = safeBase + ext;
                    let fileUri = selectedFile.url;
                    if (Platform.OS !== 'web') {
                      fileUri = await downloadFileWithToken(selectedFile.url, token, safeName);
                    }
                    navigation.navigate('FileViewer', { fileUrl: fileUri, fileName: safeName });
                  } catch (err) {
                    alert('Failed to open file: ' + (err.message || err));
                    console.log('Open file error:', err);
                  } finally {
                    setLoadingPreview(false);
                    setSelectedFile(null);
                  }
                }}
                disabled={loadingPreview}
              >
                {loadingPreview ? 'Opening...' : 'Open'}
              </Button>
              <Button onPress={() => setSelectedFile(null)} style={{ marginTop: 8 }}>Close</Button>
            </>
          )}
        </Modal>
      </Portal>
      {/* Comments Section */}
      <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface, ...(paperTheme.dark && { borderColor: paperTheme.colors.border, borderWidth: 1 }) }]} mode="elevated">
        <Card.Title title="Comments" titleStyle={{ color: paperTheme.colors.text }} />
        <Card.Content>
          {comments.map(comment => (
            <React.Fragment key={comment.id}>
              {renderComment({ item: comment })}
            </React.Fragment>
          ))}
          <TextInput
            style={[styles.commentInput, { backgroundColor: paperTheme.colors.background }]}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            placeholderTextColor={paperTheme.colors.placeholder}
            underlineColor="transparent"
          />
          <Button 
            mode="contained" 
            onPress={handleCommentSubmit} 
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Comment
          </Button>
        </Card.Content>
      </Card>
      <Modal visible={editVisible} onDismiss={() => setEditVisible(false)} contentContainerStyle={{ backgroundColor: paperTheme.colors.background, position: 'absolute', top: 0, left: 0, right: 0, margin: 0, borderRadius: 12, padding: 16, zIndex: 9999 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Update Task</Text>
        <TextInput
          label="Title"
          value={editTitle}
          onChangeText={setEditTitle}
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Description"
          value={editDescription}
          onChangeText={setEditDescription}
          multiline
          style={{ marginBottom: 12 }}
        />
        {/* Status Dropdown */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ marginBottom: 4, color: paperTheme.colors.text }}>Status</Text>
          <View style={{
            borderWidth: 1,
            borderColor: paperTheme.colors.border,
            borderRadius: 6,
            backgroundColor: paperTheme.colors.background,
            height: 44,
            justifyContent: 'center',
          }}>
            <Picker
              selectedValue={editStatus}
              onValueChange={value => setEditStatus(value)}
              style={{ width: '100%', color: paperTheme.colors.text, height: 44 }}
              dropdownIconColor={paperTheme.colors.text}
            >
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="In Progress" value="in_progress" />
              <Picker.Item label="Completed" value="completed" />
              <Picker.Item label="Declined" value="declined" />
            </Picker>
          </View>
        </View>
        <TextInput
          label="Priority"
          value={editPriority}
          onChangeText={setEditPriority}
          style={{ marginBottom: 12 }}
        />
        {/* In the edit modal, add a TextInput for remarks (required) */}
        <TextInput
          label="Remarks (required)"
          value={editRemarks}
          onChangeText={setEditRemarks}
          multiline
          style={{ marginBottom: 12 }}
          placeholder="Please provide remarks explaining the changes made to this task"
        />
        <Button mode="contained" onPress={handleEditSubmit} loading={editLoading} disabled={editLoading} style={{ marginTop: 12 }}>Save</Button>
        <Button onPress={() => setEditVisible(false)} style={{ marginTop: 8 }}>Cancel</Button>
      </Modal>
      {/* Preview Modal */}
      <Portal>
        <Modal
          visible={previewVisible}
          onDismiss={() => setPreviewVisible(false)}
          contentContainerStyle={{
            backgroundColor: '#fff',
            margin: 24,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            minWidth: 300,
          }}
        >
          {previewType === 'image' && previewUrl && (
            <Image
              source={{ uri: previewUrl }}
              style={{
                width: Dimensions.get('window').width * 0.8,
                height: Dimensions.get('window').height * 0.6,
                resizeMode: 'contain',
              }}
            />
          )}
          {previewType === 'pdf' && previewUrl && (
            Platform.OS === 'web' ? (
              (() => { window.open(previewUrl, '_blank'); setPreviewVisible(false); return <Text>PDF opened in new tab.</Text>; })()
            ) : (
              <WebView
                source={{ uri: previewUrl }}
                style={{
                  width: Dimensions.get('window').width * 0.8,
                  height: Dimensions.get('window').height * 0.6,
                }}
                useWebKit
                originWhitelist={['*']}
                startInLoadingState
              />
            )
          )}
          <Button onPress={() => setPreviewVisible(false)} style={{ marginTop: 16 }}>
            Close
          </Button>
        </Modal>
      </Portal>
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Modal visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 24, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Delete Attachment?</Text>
          <Text style={{ marginBottom: 16 }}>Are you sure you want to delete this file? This action cannot be undone.</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Button mode="contained" onPress={async () => {
              try {
                await api.deleteTaskAttachment(deleteFileId, token);
                setDeleteDialogVisible(false);
                setDeleteFileId(null);
                await fetchTaskDetails();
              } catch (err) {
                showError('Failed to delete file.');
                setDeleteDialogVisible(false);
                setDeleteFileId(null);
              }
            }} style={{ marginRight: 12 }}>Delete</Button>
            <Button mode="outlined" onPress={() => { setDeleteDialogVisible(false); setDeleteFileId(null); }}>Cancel</Button>
          </View>
        </Modal>
      </Portal>
      <Portal>
        <Modal visible={deleteCommentDialogVisible} onDismiss={() => setDeleteCommentDialogVisible(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 24, borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Delete Comment?</Text>
          <Text style={{ marginBottom: 16 }}>Are you sure you want to delete this comment? This action cannot be undone.</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Button mode="contained" onPress={async () => {
              try {
                await api.deleteTaskComment(token, deleteCommentId);
                setDeleteCommentDialogVisible(false);
                setDeleteCommentId(null);
                setComments(prev => prev.filter(c => c.id !== deleteCommentId));
              } catch (err) {
                showError('Failed to delete comment.');
                setDeleteCommentDialogVisible(false);
                setDeleteCommentId(null);
              }
            }} style={{ marginRight: 12 }}>Delete</Button>
            <Button mode="outlined" onPress={() => { setDeleteCommentDialogVisible(false); setDeleteCommentId(null); }}>Cancel</Button>
          </View>
        </Modal>
      </Portal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  description: {
    marginVertical: 16,
    lineHeight: 22,
    fontSize: 16,
  },
  statusChip: {
    marginVertical: 8,
  },
  progressBar: {
    marginVertical: 8,
    height: 8,
    borderRadius: 4,
  },
  commentCard: {
    marginBottom: 8,
  },
  commentInput: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContainer: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
  },
});

export default TaskDetailScreen; 