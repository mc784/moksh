# Moksh - Family Learning Platform

> A private, web-based educational platform for kids with flashcards, drills, progress tracking, and gamification.

## Project Overview

**Purpose**: Interactive learning platform for 4 children (Shivaya, Omjai, Kainav, Maneera) with:
- Zero-friction flashcard drills (math, science, phonics)
- Family stories with text-to-speech
- Per-child progress tracking (no passwords)
- Gamification (streaks, badges, accuracy tracking)

**Design Philosophy**:
- World-class UX inspired by Duolingo, Khan Academy Kids
- Zero setup - drills start immediately
- Dark theme, mobile-first, large touch targets
- Client-side only (no backend, localStorage persistence)

**Target Deployment**: `moksh.thinbk.ai` via Vercel (DNS configured in Namecheap)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JS (may migrate to React later) |
| Storage | localStorage (via `js/storage.js`) |
| Hosting | Vercel (static site) |
| Domain | moksh.thinbk.ai (A record → 76.76.21.21) |
| Speech | Web Speech API (SpeechSynthesis) |

---

## File Structure

```
/moksh/
├── index.html              # Profile selector (landing page)
├── CLAUDE.md               # This file - project documentation
│
├── js/
│   └── storage.js          # Core storage/tracking system (Moksh object)
│
├── avatars/
│   ├── shivaya.jpg
│   ├── omjai.jpg
│   ├── kainav.jpg
│   └── maneera.jpg
│
├── drills/
│   ├── times-tables.html   # Math flashcards (20 facts, auto-start)
│   ├── science.html        # Science facts (15 mixed, 5 categories)
│   ├── times-tables-flashcards.html  # [OLD - can be removed]
│   └── science-flashcards.html       # [OLD - can be removed]
│
├── parent/
│   └── index.html          # Parent dashboard - view kids & assign activities
│
├── shivaya/
│   ├── index.html          # Shivaya's dashboard (filters by assignments)
│   ├── stats.html          # Progress visualization
│   └── stories.html        # Phonics + family stories
│
├── omjai/
│   ├── index.html          # Omjai's dashboard (filters by assignments)
│   ├── stats.html          # Progress visualization
│   └── stories.html        # Phonics + family stories
│
├── kainav/
│   ├── index.html          # Kainav's dashboard (filters by assignments)
│   ├── stats.html          # Progress visualization
│   └── stories.html        # Phonics + family stories
│
└── maneera/
    ├── index.html          # Maneera's dashboard (filters by assignments)
    ├── stats.html          # Progress visualization
    └── stories.html        # Phonics + family stories
```

---

## Core System: `js/storage.js`

The `Moksh` object is the central data layer. All pages import it via `<script src="../js/storage.js">`.

### API Reference

```javascript
// Initialization
Moksh.init()                              // Auto-called, creates localStorage if needed

// Profile Management
Moksh.createProfile(id, name, avatar, color)  // Create new child profile
Moksh.getProfile(id)                          // Get profile by ID
Moksh.getProfiles()                           // Get all profiles
Moksh.setCurrentUser(id)                      // Set active user
Moksh.getCurrentUser()                        // Get active user profile
Moksh.getChildren()                           // Get all non-parent profiles

// Session Tracking (call in this order)
Moksh.startSession(userId, activityId)        // Start timing a drill/activity
Moksh.recordAnswer(userId, activityId, isCorrect)  // Record each answer
Moksh.endSession(userId, activityId)          // End session, save stats, update streak

// Stats Retrieval
Moksh.getActivityStats(userId, activityId)    // Get stats for specific activity
Moksh.getOverallStats(userId)                 // Get aggregate stats for user
Moksh.isActiveToday(userId)                   // Check if user practiced today

// Assignment Management (Parent controls which activities each child sees)
Moksh.getAssignments(childId)                 // Get array of assigned activity IDs
Moksh.setAssignments(childId, activityIds)    // Set all assignments for a child
Moksh.getAllAssignments()                     // Get assignments object for all children
Moksh.assignActivity(childId, activityId)     // Add single activity to child
Moksh.unassignActivity(childId, activityId)   // Remove activity from child
Moksh.isAssigned(childId, activityId)         // Check if activity is assigned (or if no assignments, returns true)

// Utilities
Moksh.formatTime(seconds)                     // Format seconds → "5m" or "1h 30m"
```

### Data Model

```javascript
// localStorage key: 'moksh'
{
  currentUser: 'shivaya',
  profiles: {
    'shivaya': {
      id: 'shivaya',
      name: 'Shivaya',
      avatar: 'avatars/shivaya.jpg',
      color: '#ec4899',
      createdAt: '2024-01-15T...',
      stats: {
        totalSessions: 15,
        totalTimeSeconds: 1800,
        currentStreak: 3,
        longestStreak: 7,
        lastActiveDate: '2024-01-15T...'
      },
      activities: {
        'times-tables': {
          attempts: 5,
          totalCorrect: 85,
          totalQuestions: 100,
          bestAccuracy: 95,
          totalTimeSeconds: 600,
          lastPlayed: '2024-01-15T...'
        },
        'science': { ... },
        'phonics-shchth': { ... }
      }
    },
    'omjai': { ... },
    'kainav': { ... },
    'maneera': { ... }
  },
  assignments: {
    'shivaya': ['times-tables', 'science', 'phonics-shchth', 'story-bua'],
    'omjai': ['times-tables', 'phonics-stspsn'],
    'kainav': [],  // Empty = shows all activities (default)
    'maneera': ['story-papa', 'story-noni']
  }
}
```

---

## Page Details

### 0. Parent Dashboard (`/parent/index.html`)

**Purpose**: Parent control panel for managing children's learning
**Features**:
- Kids overview cards showing streaks, sessions, accuracy
- Quick actions: "Assign All to Everyone", "Clear All Assignments"
- Drag-and-drop assignment interface
- Left panel: All available activities (drills, phonics, stories)
- Right panel: 4 child columns to drop activities into
- Real-time save with toast notifications

**Assignment Logic**:
- If a child has NO assignments → they see ALL activities (default behavior)
- If a child has ANY assignments → they ONLY see assigned activities
- Parents can customize what each child focuses on

### 1. Landing Page (`/index.html`)

**Purpose**: Profile selector showing all 4 kids + parent access
**Features**:
- Circular avatar photos with colored borders
- Streak badges per child
- "Active today" checkmark indicator
- **Parent Dashboard button** (purple gradient)
- Family aggregate stats (sessions, time, accuracy)
- Auto-creates profiles on first load

**User Flow**: Click avatar → navigates to `/{userId}/`

### 2. Child Dashboard (`/{userId}/index.html`)

**Purpose**: Main hub for each child
**Features**:
- Header with avatar, name, streak badge
- Stats row (clickable → stats.html): Sessions, Time, Accuracy, Best
- Practice grid: **Filtered by parent assignments** (shows message if none assigned)
- Stories grid: **Filtered by parent assignments**
- Progress bars on each activity card
- Uses `Moksh.isAssigned(userId, activityId)` to filter

**Filtering Behavior**:
- If parent has assigned activities → only those appear
- If no assignments → all activities appear (default)
- Empty state shows "No activities assigned yet. Ask a parent to assign some!"

**Color Themes**:
- Shivaya: Pink (`#ec4899`)
- Omjai: Indigo (`#6366f1`)
- Kainav: Green (`#22c55e`)
- Maneera: Amber (`#f59e0b`)

### 3. Stats Page (`/{userId}/stats.html`)

**Purpose**: Detailed progress visualization
**Features**:
- Large accuracy ring (animated SVG)
- Correct/Wrong/Total breakdown
- Streak counter with fire emoji
- Weekly calendar (7 days, shows active days)
- Activity list with individual accuracy
- Badge system (8 badges):
  - First Step (1 session)
  - On Fire (3-day streak)
  - Week Warrior (7-day streak)
  - Dedicated (10 sessions)
  - Champion (50 sessions)
  - Sharpshooter (90% accuracy)
  - Focused (30 min total)
  - Scholar (1 hour total)

### 4. Stories/Phonics (`/{userId}/stories.html`)

**Purpose**: Reading content and phonics practice
**URL Params**: `?story=shchth` or `?story=bua`

**Phonics Sets** (type: 'phonics'):
| ID | Sounds | Word Count |
|----|--------|------------|
| shchth | sh, ch, th | 15 words |
| stspsn | st, sp, sn | 15 words |
| trdrbrg | tr, dr, br, gr | 16 words |
| clblflpl | cl, bl, fl, pl | 16 words |
| ngnkmpnd | ng, nk, mp, nd | 16 words |

**Family Stories** (type: 'story'):
| ID | Title | Theme |
|----|-------|-------|
| bua | Bua Ji | Visiting aunt |
| noni | Noni Mata | Grandmother visit |
| taya | Taya Ji | Uncle fun |
| dada | Dada Dadi | Grandparents |
| papa | Papa | Father |

**Features**:
- Tap words to hear pronunciation (Web Speech API)
- Progress bar tracks words spoken
- Completion overlay with celebration
- Speaker button for full story read-aloud

### 5. Times Tables Drill (`/drills/times-tables.html`)

**Purpose**: Math multiplication practice
**Features**:
- Auto-starts immediately (no setup screen)
- 20 random facts per session from pool of 24
- Focus on harder facts: 6×6 through 9×9, plus 12s
- Tap card to reveal answer
- Correct (✓) / Wrong (✗) buttons
- Circular progress ring
- Results screen shows missed problems
- Keyboard shortcuts: Space/Enter (reveal), →/y (correct), ←/n (wrong)

**Fact Pool**:
```javascript
// Core (commonly struggled)
[6,6,36], [6,7,42], [6,8,48], [6,9,54],
[7,7,49], [7,8,56], [7,9,63],
[8,8,64], [8,9,72], [9,9,81],
// Extended
[3,7,21], [3,8,24], [3,9,27],
[4,6,24], [4,7,28], [4,8,32], [4,9,36],
[7,6,42], [8,6,48], [9,6,54],
[12,6,72], [12,7,84], [12,8,96], [12,9,108]
```

### 6. Science Drill (`/drills/science.html`)

**Purpose**: Science fact flashcards
**Features**:
- Same UX as Times Tables
- 15 facts per session, mixed from 5 categories
- Color-coded category badges
- Q&A format (question on front, answer revealed)

**Categories**:
- Physics (blue): Forces, energy, light, sound
- Chemistry (green): Elements, reactions, states of matter
- Biology (pink): Cells, body systems, ecosystems
- Geography (amber): Earth layers, weather, landforms
- Space (purple): Planets, stars, universe

---

## Development

### Local Development
```bash
cd /Users/maneeshchandan/MyDocuments/moksh
python3 -m http.server 8080
# Open http://localhost:8080
```

### Deployment (Vercel)
```bash
cd /Users/maneeshchandan/MyDocuments/moksh
vercel --prod
```

### Git Repository
- Repo: `mc784/moksh` (private)
- Remote: `git@github.com:mc784/moksh.git`

---

## Known Issues / Bugs

1. **Drill user tracking**: The drills (`times-tables.html`, `science.html`) currently hardcode `userId = 'shivaya'`. They should read from URL param `?user=` to properly track other children's progress when accessed from their dashboards.

2. **Old files to remove**: `drills/times-tables-flashcards.html` and `drills/science-flashcards.html` are old versions that can be deleted.

3. **Source images in root**: `Shivaya.jpeg`, `Omjai.jpeg`, `Kainav.jpeg`, `Maneera.jpeg` are duplicates (already copied to `/avatars/`) and can be removed.

---

## Pending / Future Work

### High Priority
- [ ] Fix drill user tracking (read `?user=` param)
- [ ] Add more science facts (currently ~50, goal: 200)
- [ ] Add more multiplication facts (include division?)

### Medium Priority
- [ ] Spaced repetition (FSRS algorithm) - prioritize missed facts
- [ ] Parent dashboard showing all kids' progress
- [ ] Audio pronunciation for phonics (pre-recorded vs TTS)
- [ ] More family stories

### Low Priority / Nice to Have
- [ ] Migrate to React for better component reuse
- [ ] Add animations/confetti on achievements
- [ ] Weekly email reports to parents
- [ ] Offline support (PWA)
- [ ] Multiple difficulty levels per drill

---

## Design Tokens

### Colors
```css
--bg: #0a0a0f;           /* Page background */
--surface: #16161f;       /* Card background */
--surface2: #1e1e2a;      /* Elevated surface */
--text: #ffffff;          /* Primary text */
--muted: #71717a;         /* Secondary text */
--success: #22c55e;       /* Correct/positive */
--error: #ef4444;         /* Wrong/negative */
--warning: #f59e0b;       /* Caution */
--accent: varies;         /* Per-child theme color */
```

### Child Theme Colors
| Child | Accent | Gradient End |
|-------|--------|--------------|
| Shivaya | #ec4899 | #a855f7 |
| Omjai | #6366f1 | #a855f7 |
| Kainav | #22c55e | #86efac |
| Maneera | #f59e0b | #fcd34d |

### Typography
- Font: System stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- Large numbers: 3.5rem, weight 700
- Body: 1rem
- Labels: 0.75-0.85rem, uppercase, letter-spacing 0.05-0.1em

### Spacing
- Section padding: 2rem (1rem on mobile)
- Card padding: 1.5rem
- Card border-radius: 16-20px
- Button size: 44px minimum touch target

---

## Session Handoff Checklist

When resuming work on this project:

1. **Verify local server**: `python3 -m http.server 8080` in `/moksh/`
2. **Check localStorage**: Open DevTools → Application → localStorage → `moksh`
3. **Test all 4 profiles**: Click each avatar, verify dashboard loads
4. **Test a drill**: Complete one Times Tables session, verify stats update
5. **Check stats page**: Verify accuracy ring, badges render correctly

---

## Contact / Context

- **Owner**: Maneesh Chandan
- **Domain Registrar**: Namecheap (thinbk.ai)
- **Hosting**: Vercel account linked to GitHub (mc784)
- **Design Inspiration**: Duolingo, Khan Academy Kids, ABCmouse
- **Children**: Shivaya, Omjai, Kainav, Maneera

---

*Last updated: May 2025*
