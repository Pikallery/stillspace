export const mockCounsellors = [
  { id: '1', name: 'Dr. Sarah Chen', specializations: ['Anxiety', 'Depression', 'Academic Stress'], rating: 4.9, is_available: true, bio: 'PhD in Clinical Psychology with 8 years experience helping students navigate academic pressure and life transitions.' },
  { id: '2', name: 'Dr. Marcus Williams', specializations: ['Trauma', 'PTSD', 'Grief'], rating: 4.8, is_available: true, bio: 'Specializes in trauma-informed care and helping students process difficult life events with compassion.' },
  { id: '3', name: 'Dr. Priya Patel', specializations: ['Relationships', 'Identity', 'Mindfulness'], rating: 4.7, is_available: false, bio: 'Expert in helping students develop healthy relationships and find their authentic selves.' },
  { id: '4', name: "Dr. James O'Brien", specializations: ['Addiction', 'Stress', 'Burnout'], rating: 4.6, is_available: true, bio: 'Passionate about helping students build resilience and healthy coping mechanisms for modern life.' },
]

export const mockEarnings = [
  { month: 'Jan', sessions: 24, rating: 4.8, earnings: 2400 },
  { month: 'Feb', sessions: 28, rating: 4.9, earnings: 2800 },
  { month: 'Mar', sessions: 22, rating: 4.7, earnings: 2200 },
  { month: 'Apr', sessions: 31, rating: 4.9, earnings: 3100 },
  { month: 'May', sessions: 26, rating: 4.8, earnings: 2600 },
  { month: 'Jun', sessions: 29, rating: 5.0, earnings: 2900 },
]

export const mockStudents = [
  { id: '1', name: 'Sai', triage_score: 3, triage_level: 'ai', trend: 'up', scores: [5, 4, 3, 3, 3] },
  { id: '2', name: 'Jordan Lee', triage_score: 6, triage_level: 'counsellor', trend: 'down', scores: [3, 4, 5, 6, 6] },
  { id: '3', name: 'Sam Rivera', triage_score: 8, triage_level: 'emergency', trend: 'up', scores: [4, 5, 6, 7, 8] },
  { id: '4', name: 'Taylor Kim', triage_score: 4, triage_level: 'ai', trend: 'neutral', scores: [4, 4, 5, 4, 4] },
]

export const motivationalQuotes = [
  "You are stronger than you think 💪",
  "Every day is a new beginning 🌟",
  "Your mental health matters 💚",
  "Small steps lead to big changes 🦋",
  "You deserve support and care 🤝",
  "Breathe. You've got this 🌸",
  "Progress, not perfection ✨",
  "Your feelings are valid 💙",
  "One day at a time 🌈",
  "You are not alone in this journey 🫂",
]

export const triageQuestions = [
  { id: 1, question: "Over the past two weeks, how often have you felt down, depressed, or hopeless?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 2, question: "How often have you had little interest or pleasure in doing things?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 3, question: "How would you rate your sleep quality recently?", options: ["Very good", "Good", "Fair", "Poor"] },
  { id: 4, question: "How often do you feel anxious or worried about your studies?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { id: 5, question: "How well are you able to concentrate on your work?", options: ["Very well", "Reasonably well", "Not very well", "Not at all"] },
  { id: 6, question: "How supported do you feel by friends and family?", options: ["Very supported", "Somewhat supported", "Slightly supported", "Not supported"] },
  { id: 7, question: "Have you experienced thoughts of harming yourself recently?", options: ["Never", "Rarely", "Sometimes", "Often"] },
  { id: 8, question: "How would you rate your overall mental wellbeing right now?", options: ["Excellent", "Good", "Fair", "Poor"] },
]

export const mockMoodTrends = [
  { day: 'Mon', avgMood: 3.2 },
  { day: 'Tue', avgMood: 3.5 },
  { day: 'Wed', avgMood: 2.8 },
  { day: 'Thu', avgMood: 3.9 },
  { day: 'Fri', avgMood: 4.1 },
  { day: 'Sat', avgMood: 3.7 },
  { day: 'Sun', avgMood: 3.4 },
]

export const mockRecentActivity = [
  { id: '1', type: 'triage', message: 'Completed mental health check-in', time: '2 hours ago' },
  { id: '2', type: 'chat', message: 'Chatted with StillSpace AI', time: '1 day ago' },
  { id: '3', type: 'community', message: 'Posted in community', time: '2 days ago' },
  { id: '4', type: 'diary', message: 'Wrote a diary entry', time: '3 days ago' },
  { id: '5', type: 'breathing', message: 'Completed breathing exercise', time: '4 days ago' },
]
