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
  { id: '1', name: 'Sai',          triage_score: 3,  triage_level: 'ai',          trend: 'up',      scores: [5, 4, 3, 3, 3],    lastMessage: "I've been feeling a bit better after our last chat, thank you!", lastMessageTime: '2m ago' },
  { id: '2', name: 'Jordan Lee',   triage_score: 6,  triage_level: 'counsellor',  trend: 'down',    scores: [3, 4, 5, 6, 6],    lastMessage: "I just can't seem to concentrate on anything lately. It's really affecting my grades.", lastMessageTime: '15m ago' },
  { id: '3', name: 'Sam Rivera',   triage_score: 8,  triage_level: 'emergency',   trend: 'up',      scores: [4, 5, 6, 7, 8],    lastMessage: "I don't know how much longer I can keep going like this. I feel so alone.", lastMessageTime: '32m ago' },
  { id: '4', name: 'Taylor Kim',   triage_score: 4,  triage_level: 'ai',          trend: 'neutral', scores: [4, 4, 5, 4, 4],    lastMessage: "The breathing exercises actually helped last night. Can we try more?", lastMessageTime: '1h ago' },
  { id: '5', name: 'Alex Morgan',  triage_score: 7,  triage_level: 'counsellor',  trend: 'down',    scores: [2, 3, 5, 6, 7],    lastMessage: "My parents keep fighting and I just hide in my room. I don't know what to do.", lastMessageTime: '2h ago' },
  { id: '6', name: 'Priya Sharma', triage_score: 5,  triage_level: 'counsellor',  trend: 'neutral', scores: [5, 5, 4, 5, 5],    lastMessage: "Exams are next week and I haven't slept properly in days. I'm so stressed.", lastMessageTime: '3h ago' },
  { id: '7', name: 'Ethan Park',   triage_score: 9,  triage_level: 'emergency',   trend: 'up',      scores: [3, 5, 6, 8, 9],    lastMessage: "Please, I really need to talk to someone. I've been having dark thoughts again.", lastMessageTime: '4h ago' },
  { id: '8', name: 'Mia Chen',     triage_score: 2,  triage_level: 'ai',          trend: 'down',    scores: [6, 5, 4, 3, 2],    lastMessage: "Things are actually going well! Just checking in like you asked.", lastMessageTime: 'Yesterday' },
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
