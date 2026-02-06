# BloomPath Testing Checklist

## Pre-Demo Testing

### Setup
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Prisma client generated (`cd backend && npx prisma generate`)
- [ ] Database created (`cd backend && npx prisma db push`)
- [ ] API key added to `backend/.env`
- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend server running (`cd frontend && npm run dev`)

### Core Features

#### 1. Onboarding
- [ ] Can enter name and due date
- [ ] User created in backend database
- [ ] Week number calculated correctly
- [ ] Redirects to dashboard after onboarding

#### 2. Mood Tracking
- [ ] Can select mood score (1-5)
- [ ] Can select multiple emotions
- [ ] Can add optional notes
- [ ] Voice input button appears (Chrome/Edge)
- [ ] Voice input transcribes speech to text
- [ ] AI insight generated after submission
- [ ] Success screen displays correctly

#### 3. EPDS Screening
- [ ] All 10 questions display correctly
- [ ] Can answer each question
- [ ] Progress bar updates
- [ ] Crisis warning appears for Question 10 if score > 0
- [ ] Score calculated correctly
- [ ] Risk level assigned correctly
- [ ] AI insight generated
- [ ] Results display properly

#### 4. AI Chat
- [ ] Welcome message appears
- [ ] Can send messages
- [ ] AI responds appropriately
- [ ] Conversation history persists
- [ ] Quick replies work
- [ ] Crisis detection triggers for concerning language
- [ ] Crisis resources displayed when triggered

#### 5. Partner Communication
- [ ] Can access partner page
- [ ] Can enter concern/feelings
- [ ] Message generated successfully
- [ ] Copy button works
- [ ] Example topics can be clicked
- [ ] Can create another message

#### 6. Insights Dashboard
- [ ] EPDS score card displays
- [ ] Latest EPDS score shown
- [ ] EPDS history section appears (if multiple screenings)
- [ ] Mood chart displays correctly
- [ ] Weekly AI summary includes EPDS context
- [ ] Top emotions display
- [ ] Concerning pattern alert appears when appropriate

### Integration Tests

- [ ] EPDS score appears in insights after screening
- [ ] Mood entries appear in insights chart
- [ ] Weekly summary references EPDS if available
- [ ] Navigation works between all pages
- [ ] User data persists across page refreshes

### Edge Cases

- [ ] App works with no mood entries
- [ ] App works with no EPDS screenings
- [ ] App handles API errors gracefully
- [ ] Fallback responses work when AI fails
- [ ] Voice input gracefully fails in unsupported browsers

### Mobile Responsiveness

- [ ] Home page responsive
- [ ] Chat page responsive
- [ ] Mood page responsive
- [ ] Screening page responsive
- [ ] Partner page responsive
- [ ] Insights page responsive
- [ ] Navigation works on mobile

### Browser Compatibility

- [ ] Chrome/Edge (voice input supported)
- [ ] Firefox (voice input not available, but app works)
- [ ] Safari (voice input not available, but app works)

## Demo Flow Test

Run through the complete demo script:

1. [ ] Onboarding (15s)
2. [ ] Mood Check-in with voice input (20s)
3. [ ] View AI Insight (15s)
4. [ ] EPDS Screening (30s)
5. [ ] Chat with AI (30s)
6. [ ] Crisis Detection test (15s)
7. [ ] Partner Communication (20s)
8. [ ] View Insights with EPDS (15s)

**Total Demo Time**: ~2 minutes 30 seconds

## Performance Checks

- [ ] Page loads quickly (< 2 seconds)
- [ ] AI responses appear within 5 seconds
- [ ] No console errors
- [ ] No network errors
- [ ] Smooth animations

## Security Checks

- [ ] API key not visible in frontend code
- [ ] No sensitive data in localStorage (except user ID)
- [ ] CORS properly configured
- [ ] Crisis resources always accessible

## Final Checklist Before Demo

- [ ] All features working
- [ ] No console errors
- [ ] Database has some test data
- [ ] API key valid and has credits
- [ ] Both servers running
- [ ] Demo script memorized
- [ ] Backup plan if API fails
