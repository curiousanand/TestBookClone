/**
 * Live Classes Slice
 * 
 * Manages live class scheduling, attendance, and real-time interactions.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
export interface LiveClass {
  id: string;
  title: string;
  description: string;
  subject: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  maxAttendees?: number;
  currentAttendees: number;
  meetingId?: string;
  meetingUrl?: string;
  meetingPassword?: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  isPublic: boolean;
  tags: string[];
  instructor: {
    id: string;
    fullName: string;
    avatar?: string;
    bio?: string;
  };
  isEnrolled: boolean;
  canJoin: boolean;
  createdAt: string;
}

export interface LiveClassFilters {
  search: string;
  subject: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | '';
  instructorId: string;
  startDate: string;
  endDate: string;
  sortBy: 'title' | 'startTime' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface Attendee {
  id: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  joinedAt: string;
  leftAt?: string;
  isPresent: boolean;
  role: 'STUDENT' | 'INSTRUCTOR' | 'MODERATOR';
  permissions: {
    canSpeak: boolean;
    canVideo: boolean;
    canChat: boolean;
    canShare: boolean;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  type: 'TEXT' | 'EMOJI' | 'SYSTEM' | 'QUESTION';
  timestamp: string;
  isPrivate: boolean;
  replyTo?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  allowMultipleChoice: boolean;
  showResults: boolean;
  totalVotes: number;
  createdAt: string;
  endsAt?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Whiteboard {
  id: string;
  data: any; // Canvas data
  lastUpdated: string;
  updatedBy: string;
}

export interface LiveClassSession {
  classId: string;
  joinUrl: string;
  token: string;
  attendees: Attendee[];
  chatMessages: ChatMessage[];
  activePolls: Poll[];
  whiteboard: Whiteboard | null;
  isRecording: boolean;
  recordingStartedAt?: string;
  breakoutRooms: BreakoutRoom[];
  settings: {
    muteOnJoin: boolean;
    videoOnJoin: boolean;
    allowChat: boolean;
    allowScreenShare: boolean;
    allowPrivateChat: boolean;
    waitingRoomEnabled: boolean;
  };
}

export interface BreakoutRoom {
  id: string;
  name: string;
  attendees: string[];
  maxAttendees: number;
  isActive: boolean;
}

export interface LiveClassState {
  // Class catalog
  classes: LiveClass[];
  currentClass: LiveClass | null;
  upcomingClasses: LiveClass[];
  
  // Filters and pagination
  filters: LiveClassFilters;
  currentPage: number;
  totalPages: number;
  totalClasses: number;
  
  // Session management
  currentSession: LiveClassSession | null;
  isInClass: boolean;
  connectionStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  
  // Media states
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  audioLevel: number;
  videoQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'AUDIO_ONLY';
  
  // UI states
  showChat: boolean;
  showAttendees: boolean;
  showWhiteboard: boolean;
  chatUnreadCount: number;
  isFullscreen: boolean;
  
  // Notifications
  notifications: LiveClassNotification[];
  
  // Loading states
  isLoading: boolean;
  isLoadingClass: boolean;
  isJoining: boolean;
  
  // Error handling
  error: string | null;
  connectionError: string | null;
}

export interface LiveClassNotification {
  id: string;
  type: 'CLASS_STARTING' | 'CLASS_REMINDER' | 'RECORDING_STARTED' | 'POLL_CREATED' | 'HAND_RAISED';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  classId?: string;
}

// Initial state
const initialState: LiveClassState = {
  classes: [],
  currentClass: null,
  upcomingClasses: [],
  
  filters: {
    search: '',
    subject: '',
    status: '',
    instructorId: '',
    startDate: '',
    endDate: '',
    sortBy: 'startTime',
    sortOrder: 'asc',
  },
  currentPage: 1,
  totalPages: 0,
  totalClasses: 0,
  
  currentSession: null,
  isInClass: false,
  connectionStatus: 'DISCONNECTED',
  
  isMicOn: false,
  isCameraOn: false,
  isScreenSharing: false,
  audioLevel: 0,
  videoQuality: 'HIGH',
  
  showChat: true,
  showAttendees: false,
  showWhiteboard: false,
  chatUnreadCount: 0,
  isFullscreen: false,
  
  notifications: [],
  
  isLoading: false,
  isLoadingClass: false,
  isJoining: false,
  
  error: null,
  connectionError: null,
};

// Async thunks
export const fetchLiveClasses = createAsyncThunk(
  'liveClasses/fetchLiveClasses',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      subject?: string;
      status?: string;
      instructorId?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/live-classes?${searchParams.toString()}`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch live classes');
      }

      return {
        classes: data.data,
        meta: data.meta,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchLiveClass = createAsyncThunk(
  'liveClasses/fetchLiveClass',
  async (classId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/live-classes/${classId}`);
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Class not found');
      }

      return data.data.liveClass;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const joinLiveClass = createAsyncThunk(
  'liveClasses/joinLiveClass',
  async (classId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch(`/api/live-classes/${classId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to join class');
      }

      return {
        classId,
        session: data.data,
      };
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchUpcomingClasses = createAsyncThunk(
  'liveClasses/fetchUpcomingClasses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await fetch('/api/users/me/upcoming-classes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.error?.message || 'Failed to fetch upcoming classes');
      }

      return data.data.classes;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Live class slice
const liveClassSlice = createSlice({
  name: 'liveClasses',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<LiveClassFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Session actions
    setConnectionStatus: (state, action: PayloadAction<LiveClassState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      
      if (action.payload === 'CONNECTED') {
        state.isInClass = true;
        state.connectionError = null;
      } else if (action.payload === 'DISCONNECTED') {
        state.isInClass = false;
      }
    },
    
    // Media controls
    toggleMicrophone: (state) => {
      state.isMicOn = !state.isMicOn;
    },
    
    toggleCamera: (state) => {
      state.isCameraOn = !state.isCameraOn;
    },
    
    toggleScreenShare: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },
    
    setAudioLevel: (state, action: PayloadAction<number>) => {
      state.audioLevel = action.payload;
    },
    
    setVideoQuality: (state, action: PayloadAction<LiveClassState['videoQuality']>) => {
      state.videoQuality = action.payload;
    },
    
    // UI controls
    toggleChat: (state) => {
      state.showChat = !state.showChat;
      if (state.showChat) {
        state.chatUnreadCount = 0;
      }
    },
    
    toggleAttendees: (state) => {
      state.showAttendees = !state.showAttendees;
    },
    
    toggleWhiteboard: (state) => {
      state.showWhiteboard = !state.showWhiteboard;
    },
    
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    // Session management
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentSession) {
        state.currentSession.chatMessages.push(action.payload);
        
        if (!state.showChat && action.payload.type !== 'SYSTEM') {
          state.chatUnreadCount += 1;
        }
      }
    },
    
    updateAttendee: (state, action: PayloadAction<Attendee>) => {
      if (state.currentSession) {
        const index = state.currentSession.attendees.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.currentSession.attendees[index] = action.payload;
        } else {
          state.currentSession.attendees.push(action.payload);
        }
      }
    },
    
    removeAttendee: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.attendees = state.currentSession.attendees.filter(
          a => a.id !== action.payload
        );
      }
    },
    
    addPoll: (state, action: PayloadAction<Poll>) => {
      if (state.currentSession) {
        state.currentSession.activePolls.push(action.payload);
      }
    },
    
    updatePoll: (state, action: PayloadAction<{ pollId: string; updates: Partial<Poll> }>) => {
      if (state.currentSession) {
        const poll = state.currentSession.activePolls.find(p => p.id === action.payload.pollId);
        if (poll) {
          Object.assign(poll, action.payload.updates);
        }
      }
    },
    
    updateWhiteboard: (state, action: PayloadAction<Whiteboard>) => {
      if (state.currentSession) {
        state.currentSession.whiteboard = action.payload;
      }
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<LiveClassNotification>) => {
      state.notifications.unshift(action.payload);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Session cleanup
    leaveClass: (state) => {
      state.currentSession = null;
      state.isInClass = false;
      state.connectionStatus = 'DISCONNECTED';
      state.isMicOn = false;
      state.isCameraOn = false;
      state.isScreenSharing = false;
      state.showChat = true;
      state.showAttendees = false;
      state.showWhiteboard = false;
      state.chatUnreadCount = 0;
      state.isFullscreen = false;
      state.connectionError = null;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
      state.connectionError = null;
    },
    
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
    },
    
    // Reset state
    reset: () => initialState,
  },
  
  extraReducers: (builder) => {
    // Fetch live classes
    builder
      .addCase(fetchLiveClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLiveClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes = action.payload.classes;
        state.currentPage = action.payload.meta.page;
        state.totalPages = action.payload.meta.totalPages;
        state.totalClasses = action.payload.meta.total;
        state.error = null;
      })
      .addCase(fetchLiveClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch live class
    builder
      .addCase(fetchLiveClass.pending, (state) => {
        state.isLoadingClass = true;
        state.error = null;
      })
      .addCase(fetchLiveClass.fulfilled, (state, action) => {
        state.isLoadingClass = false;
        state.currentClass = action.payload;
        state.error = null;
      })
      .addCase(fetchLiveClass.rejected, (state, action) => {
        state.isLoadingClass = false;
        state.error = action.payload as string;
      });

    // Join live class
    builder
      .addCase(joinLiveClass.pending, (state) => {
        state.isJoining = true;
        state.connectionError = null;
      })
      .addCase(joinLiveClass.fulfilled, (state, action) => {
        state.isJoining = false;
        state.currentSession = action.payload.session;
        state.connectionStatus = 'CONNECTED';
        state.isInClass = true;
        state.connectionError = null;
      })
      .addCase(joinLiveClass.rejected, (state, action) => {
        state.isJoining = false;
        state.connectionError = action.payload as string;
      });

    // Fetch upcoming classes
    builder
      .addCase(fetchUpcomingClasses.fulfilled, (state, action) => {
        state.upcomingClasses = action.payload;
      });
  },
});

// Actions
export const {
  setFilters,
  clearFilters,
  setSearch,
  setPage,
  setConnectionStatus,
  toggleMicrophone,
  toggleCamera,
  toggleScreenShare,
  setAudioLevel,
  setVideoQuality,
  toggleChat,
  toggleAttendees,
  toggleWhiteboard,
  toggleFullscreen,
  addChatMessage,
  updateAttendee,
  removeAttendee,
  addPoll,
  updatePoll,
  updateWhiteboard,
  addNotification,
  markNotificationRead,
  clearNotifications,
  leaveClass,
  clearError,
  setConnectionError,
  reset,
} = liveClassSlice.actions;

// Selectors
export const selectLiveClasses = (state: RootState) => state.liveClasses;
export const selectLiveClassList = (state: RootState) => state.liveClasses.classes;
export const selectCurrentClass = (state: RootState) => state.liveClasses.currentClass;
export const selectCurrentSession = (state: RootState) => state.liveClasses.currentSession;
export const selectUpcomingClasses = (state: RootState) => state.liveClasses.upcomingClasses;
export const selectIsInClass = (state: RootState) => state.liveClasses.isInClass;
export const selectConnectionStatus = (state: RootState) => state.liveClasses.connectionStatus;
export const selectLiveClassFilters = (state: RootState) => state.liveClasses.filters;
export const selectLiveClassLoading = (state: RootState) => state.liveClasses.isLoading;
export const selectLiveClassError = (state: RootState) => state.liveClasses.error;

// Complex selectors
export const selectLiveClassesByStatus = (status: LiveClass['status']) => (state: RootState) => {
  return state.liveClasses.classes.filter(liveClass => liveClass.status === status);
};

export const selectTodayClasses = (state: RootState) => {
  const today = new Date().toISOString().split('T')[0];
  return state.liveClasses.classes.filter(liveClass => 
    liveClass.startTime.startsWith(today)
  );
};

export const selectChatMessages = (state: RootState) => {
  return state.liveClasses.currentSession?.chatMessages || [];
};

export const selectActivePolls = (state: RootState) => {
  return state.liveClasses.currentSession?.activePolls.filter(poll => poll.isActive) || [];
};

export const selectUnreadNotifications = (state: RootState) => {
  return state.liveClasses.notifications.filter(notification => !notification.isRead);
};

export default liveClassSlice.reducer;