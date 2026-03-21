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

// ── Mock chat histories (counsellor view) ────────────────────────────────────
// sender: 'c' = counsellor (me), 's' = student

export const mockChatHistories: Record<string, { sender: 'c' | 's'; content: string; minutesAgo: number }[]> = {
  '1': [ // Sai — improving, low-risk
    { sender: 's', content: "Hi, I just wanted to check in. I've been having some rough days but today felt a little better.", minutesAgo: 2950 },
    { sender: 'c', content: "Hi Sai! I'm really glad you reached out. That's great to hear that today was a bit better — what do you think made it feel different?", minutesAgo: 2940 },
    { sender: 's', content: "I think I slept a bit more than usual. Like 6 hours instead of 4. It made a difference.", minutesAgo: 2930 },
    { sender: 'c', content: "Sleep really does change everything. Even one extra hour can shift your mood noticeably. Are you able to keep that up, do you think?", minutesAgo: 2920 },
    { sender: 's', content: "I'll try. I've been on my phone until 2am most nights which I know isn't great.", minutesAgo: 2910 },
    { sender: 'c', content: "That's actually a really insightful observation. What if we tried a small experiment — phone off by midnight for just three nights? No pressure, just see how it goes.", minutesAgo: 2900 },
    { sender: 's', content: "Yeah I can try that. Midnight sounds doable.", minutesAgo: 2890 },
    { sender: 'c', content: "Perfect. Let me know how it goes. And remember — you can message me anytime. You're doing great by even checking in today 💙", minutesAgo: 2880 },
    { sender: 's', content: "I've been feeling a bit better after our last chat, thank you!", minutesAgo: 2 },
  ],

  '2': [ // Jordan Lee — struggling with concentration, counsellor-level
    { sender: 's', content: "Hey, I don't really know where to start. I've just been... blank. Like I open my textbook and nothing goes in.", minutesAgo: 1400 },
    { sender: 'c', content: "Hi Jordan. I hear you — that blankness is really exhausting. How long has it been feeling this way?", minutesAgo: 1390 },
    { sender: 's', content: "Maybe three weeks? It started around when midterms were announced. Now even scrolling my phone feels like too much effort.", minutesAgo: 1380 },
    { sender: 'c', content: "That sounds like your mind is hitting a wall. Sometimes when anxiety is very high, our brain actually shuts down to protect us. Does that feel familiar — like a shutting-down more than a giving-up?", minutesAgo: 1370 },
    { sender: 's', content: "Yeah. Like I WANT to study but I literally can't make myself start.", minutesAgo: 1360 },
    { sender: 'c', content: "That's really important — you want to, but can't. That's not laziness, that's overwhelm. Let's talk about what's happening around study time. Where are you when you try? What does the environment look like?", minutesAgo: 1350 },
    { sender: 's', content: "Usually in my room. My roommate is loud though and I get distracted.", minutesAgo: 1340 },
    { sender: 'c', content: "Environment matters so much. What if you tried the library for even just 45 minutes? A change of space can sometimes break the pattern.", minutesAgo: 1330 },
    { sender: 's', content: "I tried once but then I just sat there doing nothing for an hour.", minutesAgo: 1320 },
    { sender: 'c', content: "That's still worth something — you showed up. Next time, bring only ONE thing to do. One chapter. One problem set. Give yourself permission to leave after that one thing is done.", minutesAgo: 1310 },
    { sender: 's', content: "I just can't seem to concentrate on anything lately. It's really affecting my grades.", minutesAgo: 15 },
  ],

  '3': [ // Sam Rivera — emergency, feeling alone
    { sender: 's', content: "I don't know why I'm even messaging. I just have no one else to talk to.", minutesAgo: 2100 },
    { sender: 'c', content: "I'm really glad you did. Even if it feels like there's no one — I'm here, right now, and I want to hear you. What's happening?", minutesAgo: 2090 },
    { sender: 's', content: "Everything just feels pointless. Like I wake up and I don't know why.", minutesAgo: 2080 },
    { sender: 'c', content: "That sounds incredibly heavy. When you say pointless — are you having any thoughts of hurting yourself or not wanting to be here?", minutesAgo: 2070 },
    { sender: 's', content: "Sometimes I just think... what if I just didn't exist. Not like a plan, just a thought.", minutesAgo: 2060 },
    { sender: 'c', content: "Thank you for trusting me with that. Those thoughts matter and they're telling us you need more support. You're not alone in this — I want us to put a safety plan together today. Can we talk through that?", minutesAgo: 2050 },
    { sender: 's', content: "I guess. I just feel like no one would actually notice.", minutesAgo: 2040 },
    { sender: 'c', content: "I would notice. And I'm noticing right now. You matter, Sam — the fact that you reached out today is so important. Let's talk about who else is in your life, even just one person.", minutesAgo: 2030 },
    { sender: 's', content: "There's my cousin. We used to be close but I haven't talked to her in months.", minutesAgo: 2020 },
    { sender: 'c', content: "That's someone. Would you be willing to send her one message today — doesn't have to be deep, just 'hey, been thinking of you'? Just reconnecting one thread.", minutesAgo: 2010 },
    { sender: 's', content: "Maybe. I don't know how much longer I can keep going like this. I feel so alone.", minutesAgo: 32 },
  ],

  '4': [ // Taylor Kim — improving, breathing exercises
    { sender: 's', content: "Hi! I did the box breathing thing you showed me before my presentation and it actually helped!!", minutesAgo: 3200 },
    { sender: 'c', content: "Taylor! That's amazing!! How did the presentation go?", minutesAgo: 3190 },
    { sender: 's', content: "Better than expected honestly. My hands still shook a bit but I got through it without freezing.", minutesAgo: 3180 },
    { sender: 'c', content: "That's huge progress. A few weeks ago you told me you'd gone blank in a presentation and had to sit down. Getting through it — even with shaky hands — is a real win.", minutesAgo: 3170 },
    { sender: 's', content: "Yeah I keep reminding myself of that. Can you send me more breathing exercises? I want to practice regularly.", minutesAgo: 3160 },
    { sender: 'c', content: "Absolutely. Besides box breathing, try 4-7-8 breathing for sleep: inhale 4 counts, hold 7, exhale 8. Very calming. Try it tonight before bed.", minutesAgo: 3150 },
    { sender: 's', content: "Oh I'll definitely try that. I've been sleeping better overall since we started talking.", minutesAgo: 3140 },
    { sender: 'c', content: "I'm so glad to hear that. You've been putting in real effort, Taylor. It shows.", minutesAgo: 3130 },
    { sender: 's', content: "The breathing exercises actually helped last night. Can we try more?", minutesAgo: 60 },
  ],

  '5': [ // Alex Morgan — family conflict, counsellor-level
    { sender: 's', content: "My parents had another huge fight last night. I stayed in my room with headphones on for 4 hours.", minutesAgo: 1800 },
    { sender: 'c', content: "That sounds really exhausting and scary. How often is this happening?", minutesAgo: 1790 },
    { sender: 's', content: "Like every other day now. It's been getting worse since February.", minutesAgo: 1780 },
    { sender: 'c', content: "Three months of this — that's a long time to be managing that stress alone. Has anyone else in your family noticed or talked to you about it?", minutesAgo: 1770 },
    { sender: 's', content: "No. I'm the oldest so I kind of just... hold it together for my siblings.", minutesAgo: 1760 },
    { sender: 'c', content: "You've been carrying a lot. Being the 'strong one' for everyone is exhausting — and you don't have to do that here. This is your space. How are YOU feeling, underneath all of it?", minutesAgo: 1750 },
    { sender: 's', content: "Honestly? Scared. Like I keep thinking — what if they split up. What happens to us.", minutesAgo: 1740 },
    { sender: 'c', content: "That fear makes complete sense. The uncertainty is often worse than whatever actually happens. Can I ask — do you feel safe at home? Is the conflict ever physical?", minutesAgo: 1730 },
    { sender: 's', content: "No, just really loud shouting. But it rattles me every time.", minutesAgo: 1720 },
    { sender: 'c', content: "Emotional safety matters just as much. Let's work on what you can control — your own space, how you recover after these episodes. Do you have a place you can go when it gets bad?", minutesAgo: 1710 },
    { sender: 's', content: "My parents keep fighting and I just hide in my room. I don't know what to do.", minutesAgo: 120 },
  ],

  '6': [ // Priya Sharma — exam stress, sleep deprivation
    { sender: 's', content: "I have 3 exams in 5 days and I don't think I've studied enough. I keep redoing the same chapter.", minutesAgo: 2400 },
    { sender: 'c', content: "Hi Priya. That re-reading loop is so common under exam stress — your brain is seeking certainty it can't get that way. How much sleep are you getting?", minutesAgo: 2390 },
    { sender: 's', content: "Like 3-4 hours. I know it's bad. But I feel guilty sleeping when there's so much to cover.", minutesAgo: 2380 },
    { sender: 'c', content: "Here's the thing — memory consolidation happens during sleep. You're actually studying less efficiently on 4 hours than you would on 7. Less time but better quality.", minutesAgo: 2370 },
    { sender: 's', content: "My brain knows that logically but at 1am I just panic and keep going.", minutesAgo: 2360 },
    { sender: 'c', content: "That panic at 1am — what does it sound like? What are you telling yourself?", minutesAgo: 2350 },
    { sender: 's', content: "That I'm going to fail. That I'm going to disappoint my parents. That everyone else is more prepared than me.", minutesAgo: 2340 },
    { sender: 'c', content: "Those are really loud thoughts. Can we look at that last one — 'everyone else is more prepared'. Is that something you actually know, or is it your anxiety telling you a story?", minutesAgo: 2330 },
    { sender: 's', content: "...probably my anxiety. My friend Nisha said she's also panicking.", minutesAgo: 2320 },
    { sender: 'c', content: "Exactly. You're not alone in this. Let's make a simple plan — which 3 topics are most likely to appear? Let's focus there, not everywhere.", minutesAgo: 2310 },
    { sender: 's', content: "Exams are next week and I haven't slept properly in days. I'm so stressed.", minutesAgo: 180 },
  ],

  '7': [ // Ethan Park — emergency, dark thoughts
    { sender: 's', content: "I don't really know how to say this. I've been having thoughts that I'd be better off not being here.", minutesAgo: 3600 },
    { sender: 'c', content: "Thank you for telling me that, Ethan. That takes real courage. Are you safe right now, in this moment?", minutesAgo: 3590 },
    { sender: 's', content: "Yeah I'm at home. Not going to do anything. But the thoughts keep coming back.", minutesAgo: 3580 },
    { sender: 'c', content: "I hear you. Recurring thoughts like that are serious and you deserve real support. I'm flagging this so our team can follow up — but I want to stay with you right now. How long has this been happening?", minutesAgo: 3570 },
    { sender: 's', content: "A few weeks. It got worse after my grandfather passed away in January.", minutesAgo: 3560 },
    { sender: 'c', content: "I'm so sorry about your grandfather. Grief can be overwhelming, especially when there's no space to process it. Has anyone else in your life known how you've been feeling?", minutesAgo: 3550 },
    { sender: 's', content: "No. I don't want to worry them. My mom is already dealing with a lot.", minutesAgo: 3540 },
    { sender: 'c', content: "That's such a compassionate instinct — protecting her. But Ethan, what you're carrying right now is too heavy to carry alone. Would you be willing to let one person in — not everything, just 'I'm not doing well'?", minutesAgo: 3530 },
    { sender: 's', content: "Maybe my older brother. He's always been pretty calm about stuff.", minutesAgo: 3520 },
    { sender: 'c', content: "That's good. I'd also like to share the crisis line with you — 988 (call or text, 24/7). Not because you're in immediate danger, but so you have it when those thoughts get loud at night. Can you save that number?", minutesAgo: 3510 },
    { sender: 's', content: "Yeah I'll save it. Thank you for not making me feel crazy.", minutesAgo: 3500 },
    { sender: 'c', content: "You're not crazy at all. You're a person in pain who reached out — that's one of the bravest things you can do. I'll follow up tomorrow morning. 💙", minutesAgo: 3490 },
    { sender: 's', content: "Please, I really need to talk to someone. I've been having dark thoughts again.", minutesAgo: 240 },
  ],

  '8': [ // Mia Chen — improving, doing well
    { sender: 's', content: "Hey! Just wanted to say — I got my assignment back and got a B+! First time in months I didn't totally bomb it.", minutesAgo: 2880 },
    { sender: 'c', content: "Mia!! That's wonderful!! How do you feel?", minutesAgo: 2870 },
    { sender: 's', content: "Honestly proud? Like genuinely. I used the planning technique we talked about and it actually helped.", minutesAgo: 2860 },
    { sender: 'c', content: "That's YOUR work. You showed up and used the strategies — that's all you. How's the anxiety been this week?", minutesAgo: 2850 },
    { sender: 's', content: "Much better. Still have moments but I don't spiral like I used to. I catch myself now.", minutesAgo: 2840 },
    { sender: 'c', content: "That self-awareness is huge. Catching yourself mid-spiral is a skill you've built. How are things at home?", minutesAgo: 2830 },
    { sender: 's', content: "Also better. I talked to my mum like you suggested. It was awkward but she actually listened.", minutesAgo: 2820 },
    { sender: 'c', content: "That conversation took real courage. I know it was scary to initiate. How did you feel afterward?", minutesAgo: 2810 },
    { sender: 's', content: "Lighter. Like some weight was lifted. I cried a bit lol but good crying.", minutesAgo: 2800 },
    { sender: 'c', content: "Good crying is valid crying 😊 Mia, you've come such a long way. I'm really proud of you.", minutesAgo: 2790 },
    { sender: 's', content: "Things are actually going well! Just checking in like you asked.", minutesAgo: 1440 },
  ],
}

export const mockRecentActivity = [
  { id: '1', type: 'triage', message: 'Completed mental health check-in', time: '2 hours ago' },
  { id: '2', type: 'chat', message: 'Chatted with StillSpace AI', time: '1 day ago' },
  { id: '3', type: 'community', message: 'Posted in community', time: '2 days ago' },
  { id: '4', type: 'diary', message: 'Wrote a diary entry', time: '3 days ago' },
  { id: '5', type: 'breathing', message: 'Completed breathing exercise', time: '4 days ago' },
]
