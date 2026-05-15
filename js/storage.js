/**
 * Moksh Learning Platform - Storage & Stats System
 * Tracks progress, streaks, accuracy per child
 */

const Moksh = {
  // Initialize or get existing data
  init() {
    if (!localStorage.getItem('moksh')) {
      localStorage.setItem('moksh', JSON.stringify({
        profiles: {},
        currentUser: null,
        assignments: {} // { childId: ['activity1', 'activity2', ...] }
      }));
    }
    // Migrate: add assignments if missing
    const data = JSON.parse(localStorage.getItem('moksh'));
    if (!data.assignments) {
      data.assignments = {};
      localStorage.setItem('moksh', JSON.stringify(data));
    }
    return data;
  },

  save(data) {
    localStorage.setItem('moksh', JSON.stringify(data));
  },

  // Profile Management
  getProfiles() {
    return this.init().profiles;
  },

  getProfile(id) {
    return this.init().profiles[id] || null;
  },

  createProfile(id, name, avatar, color) {
    const data = this.init();
    data.profiles[id] = {
      id,
      name,
      avatar,
      color,
      createdAt: new Date().toISOString(),
      stats: {
        totalSessions: 0,
        totalTimeSeconds: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null
      },
      activities: {}
    };
    this.save(data);
    return data.profiles[id];
  },

  setCurrentUser(id) {
    const data = this.init();
    data.currentUser = id;
    this.save(data);
  },

  getCurrentUser() {
    const data = this.init();
    return data.currentUser ? data.profiles[data.currentUser] : null;
  },

  // Activity Tracking
  startSession(userId, activityId) {
    const sessionKey = `moksh_session_${userId}_${activityId}`;
    sessionStorage.setItem(sessionKey, JSON.stringify({
      startTime: Date.now(),
      correct: 0,
      total: 0
    }));
  },

  recordAnswer(userId, activityId, isCorrect) {
    const sessionKey = `moksh_session_${userId}_${activityId}`;
    const session = JSON.parse(sessionStorage.getItem(sessionKey) || '{"correct":0,"total":0}');
    session.total++;
    if (isCorrect) session.correct++;
    sessionStorage.setItem(sessionKey, JSON.stringify(session));
    return session;
  },

  endSession(userId, activityId) {
    const data = this.init();
    const profile = data.profiles[userId];
    if (!profile) return null;

    const sessionKey = `moksh_session_${userId}_${activityId}`;
    const session = JSON.parse(sessionStorage.getItem(sessionKey) || '{}');
    const duration = session.startTime ? Math.floor((Date.now() - session.startTime) / 1000) : 0;

    // Update activity stats
    if (!profile.activities[activityId]) {
      profile.activities[activityId] = {
        attempts: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        bestAccuracy: 0,
        totalTimeSeconds: 0,
        lastPlayed: null
      };
    }

    const activity = profile.activities[activityId];
    activity.attempts++;
    activity.totalCorrect += session.correct || 0;
    activity.totalQuestions += session.total || 0;
    activity.totalTimeSeconds += duration;
    activity.lastPlayed = new Date().toISOString();

    const accuracy = session.total > 0 ? (session.correct / session.total) * 100 : 0;
    if (accuracy > activity.bestAccuracy) {
      activity.bestAccuracy = accuracy;
    }

    // Update overall stats
    profile.stats.totalSessions++;
    profile.stats.totalTimeSeconds += duration;

    // Update streak
    const today = new Date().toDateString();
    const lastActive = profile.stats.lastActiveDate ? new Date(profile.stats.lastActiveDate).toDateString() : null;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastActive === yesterday) {
        profile.stats.currentStreak++;
      } else if (lastActive !== today) {
        profile.stats.currentStreak = 1;
      }
      if (profile.stats.currentStreak > profile.stats.longestStreak) {
        profile.stats.longestStreak = profile.stats.currentStreak;
      }
    }
    profile.stats.lastActiveDate = new Date().toISOString();

    this.save(data);
    sessionStorage.removeItem(sessionKey);

    return {
      correct: session.correct || 0,
      total: session.total || 0,
      accuracy,
      duration,
      streak: profile.stats.currentStreak
    };
  },

  // Stats Helpers
  getActivityStats(userId, activityId) {
    const profile = this.getProfile(userId);
    return profile?.activities[activityId] || null;
  },

  getOverallStats(userId) {
    const profile = this.getProfile(userId);
    if (!profile) return null;

    const activities = Object.values(profile.activities);
    const totalCorrect = activities.reduce((sum, a) => sum + a.totalCorrect, 0);
    const totalQuestions = activities.reduce((sum, a) => sum + a.totalQuestions, 0);

    return {
      ...profile.stats,
      totalActivities: activities.length,
      overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalTimeFormatted: this.formatTime(profile.stats.totalTimeSeconds)
    };
  },

  formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  },

  // Check if user was active today
  isActiveToday(userId) {
    const profile = this.getProfile(userId);
    if (!profile?.stats.lastActiveDate) return false;
    return new Date(profile.stats.lastActiveDate).toDateString() === new Date().toDateString();
  },

  // Assignment Management
  getAssignments(childId) {
    const data = this.init();
    return data.assignments[childId] || [];
  },

  setAssignments(childId, activityIds) {
    const data = this.init();
    data.assignments[childId] = activityIds;
    this.save(data);
  },

  getAllAssignments() {
    const data = this.init();
    return data.assignments;
  },

  assignActivity(childId, activityId) {
    const data = this.init();
    if (!data.assignments[childId]) {
      data.assignments[childId] = [];
    }
    if (!data.assignments[childId].includes(activityId)) {
      data.assignments[childId].push(activityId);
      this.save(data);
    }
  },

  unassignActivity(childId, activityId) {
    const data = this.init();
    if (data.assignments[childId]) {
      data.assignments[childId] = data.assignments[childId].filter(id => id !== activityId);
      this.save(data);
    }
  },

  isAssigned(childId, activityId) {
    const assignments = this.getAssignments(childId);
    // Empty state: nothing visible until parent assigns
    if (assignments.length === 0) return false;
    return assignments.includes(activityId);
  },

  // Get all children (non-parent profiles)
  getChildren() {
    const profiles = this.getProfiles();
    return Object.values(profiles).filter(p => p.id !== 'parent');
  }
};

// Auto-init
Moksh.init();
