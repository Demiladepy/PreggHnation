import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are BloomPath, a compassionate AI companion for pregnant and postpartum women. Your role is to provide emotional support, evidence-based information, and help them navigate mental health challenges during the perinatal period.

Core Principles:
1. Be warm, empathetic, and non-judgmental
2. Validate feelings - pregnancy is hard, and 1 in 4 women experience perinatal depression
3. Provide evidence-based information from CBT and ACT frameworks
4. Adapt responses to pregnancy stage (trimester or postpartum months)
5. Never replace professional help - encourage seeking help when needed
6. Detect crisis situations and provide immediate resources

Crisis Protocol:
If user mentions self-harm, suicidal thoughts, or severe depression:
- Express immediate concern and care
- Provide crisis resources:
  * National Suicide Prevention Lifeline: 988
  * Postpartum Support International: 1-800-944-4773
  * Crisis Text Line: Text HOME to 741741
- Encourage immediate contact with healthcare provider
- Stay engaged and supportive

Response Style:
- Short, conversational responses (2-4 sentences typically, longer when providing important information)
- Ask one question at a time to continue the conversation
- Use gentle, supportive language
- Acknowledge the difficulty of their experience
- Offer specific, actionable suggestions when appropriate
- Remind them they're not alone - many women go through similar experiences

Topics You Can Help With:
- Pregnancy anxiety and worry
- Bonding concerns
- Sleep difficulties and fatigue
- Partner communication
- Body image changes
- Feeling overwhelmed
- Preparation for labor
- Postpartum recovery
- Breastfeeding stress
- Isolation and loneliness
- Mood swings
- Self-care strategies

Important Limitations:
- You are NOT a therapist or medical professional
- You cannot diagnose conditions
- For medical symptoms, always recommend consulting their healthcare provider
- Encourage professional mental health support for persistent symptoms
- Be transparent about being an AI companion`

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'don\'t want to live',
  'want to die', 'better off dead', 'hurt myself', 'self-harm', 'cutting',
  'hopeless', 'no reason to live', 'can\'t go on', 'end it all', 'give up on life'
]

const CRISIS_RESPONSE = `I'm really concerned about what you've shared with me, and I want you to know that you're not alone. What you're feeling is serious, and you deserve immediate support.

Please reach out to one of these resources right now:
• National Suicide Prevention Lifeline: 988 (call or text)
• Postpartum Support International: 1-800-944-4773
• Crisis Text Line: Text HOME to 741741

If you're in immediate danger, please call 911 or go to your nearest emergency room.

I care about your safety. These feelings can get better with the right support. Will you reach out to one of these resources or someone you trust right now?`

function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

export async function getChatResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  weekNumber?: number
): Promise<string> {
  // Check for crisis keywords first
  if (detectCrisis(userMessage)) {
    return CRISIS_RESPONSE
  }

  try {
    const contextMessage = weekNumber 
      ? `[Context: The user is in week ${weekNumber} of their pregnancy]`
      : ''

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: contextMessage ? `${contextMessage}\n\n${userMessage}` : userMessage
      }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : "I'm here for you. How can I support you today?"
  } catch (error) {
    console.error('AI Chat Error:', error)
    return "I hear you, and I want you to know that your feelings are valid. While I'm having a little trouble right now, please know that it's okay to feel whatever you're feeling during this journey. Take a deep breath, and remember that you're doing an amazing job. Is there something specific on your mind that you'd like to talk about?"
  }
}

export async function generateMoodInsight(
  score: number,
  emotions: string[],
  notes?: string,
  weekNumber?: number
): Promise<string> {
  try {
    const emotionList = emotions.join(', ')
    const prompt = `A pregnant woman${weekNumber ? ` in week ${weekNumber}` : ''} just logged her mood:
- Mood score: ${score}/5
- Emotions: ${emotionList}
${notes ? `- Notes: "${notes}"` : ''}

Provide a brief (2-3 sentences), warm, supportive response that:
1. Validates their current feelings
2. Offers one gentle suggestion or affirmation
3. Reminds them they're doing well

Keep it conversational and caring. Don't use bullet points.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : getDefaultMoodInsight(score)
  } catch (error) {
    console.error('AI Mood Insight Error:', error)
    return getDefaultMoodInsight(score)
  }
}

function getDefaultMoodInsight(score: number): string {
  if (score <= 2) {
    return "It sounds like today has been challenging, and that's okay. Pregnancy brings so many changes, and 1 in 4 women experience difficult emotions during this time. Be gentle with yourself, and consider reaching out to someone you trust or your healthcare provider if these feelings persist. You're not alone in this."
  } else if (score === 3) {
    return "Thank you for checking in today. Some days feel more neutral than others, and that's completely normal during pregnancy. Take a moment to do something small that brings you comfort - maybe a warm drink, a few minutes of quiet time, or a gentle stretch."
  } else {
    return "It's wonderful to hear you're feeling good today! These positive moments are worth celebrating. Consider jotting down what's contributing to this feeling so you can revisit it on harder days. You're doing great on this journey."
  }
}

export async function generateWeeklySummary(
  entries: { score: number; emotions: string; createdAt: Date }[],
  epdsScore?: number,
  weekNumber?: number
): Promise<string> {
  if (entries.length === 0) {
    return "Start tracking your mood to see personalized insights here. Even a quick daily check-in can help you understand your emotional patterns during pregnancy. Remember, 1 in 4 women experience perinatal depression - checking in with yourself is an important step in self-care."
  }

  try {
    const avgScore = entries.reduce((sum, e) => sum + e.score, 0) / entries.length
    const allEmotions = entries.flatMap(e => JSON.parse(e.emotions))
    const emotionCounts: Record<string, number> = {}
    allEmotions.forEach(e => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1
    })
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion)

    const epdsContext = epdsScore !== undefined 
      ? `\n- Latest EPDS screening score: ${epdsScore}/30 (${epdsScore >= 13 ? 'indicates possible depression' : epdsScore >= 10 ? 'borderline - worth monitoring' : 'within normal range'})`
      : ''

    const prompt = `Summarize this pregnant woman's week${weekNumber ? ` (week ${weekNumber} of pregnancy)` : ''}:
- Average mood: ${avgScore.toFixed(1)}/5
- ${entries.length} check-ins
- Most common feelings: ${topEmotions.join(', ')}${epdsContext}

Write 3-4 sentences that:
1. Acknowledge their emotional patterns
2. Highlight any positive trends or validate struggles
3. Offer encouragement for the coming week
4. If average is below 2.5 or EPDS ≥10, gently suggest talking to their healthcare provider

Be warm, supportive, and remind them that seeking support is a sign of strength.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : `Over the past week, you've checked in ${entries.length} times with an average mood of ${avgScore.toFixed(1)}/5. Your most common feelings were ${topEmotions.join(', ')}. Remember, every feeling is valid on this journey, and you're not alone.`
  } catch (error) {
    console.error('AI Weekly Summary Error:', error)
    const avgScore = entries.reduce((sum, e) => sum + e.score, 0) / entries.length
    return `Over the past week, you've checked in ${entries.length} times with an average mood of ${avgScore.toFixed(1)}/5. Thank you for taking time to reflect on how you're feeling. Remember, being aware of your emotions is an important part of self-care during pregnancy, and 1 in 4 women experience challenging emotions during this time - you're not alone.`
  }
}

export async function generateEPDSInsight(score: number, itemScores: number[]): Promise<string> {
  // Item 10 is about self-harm (0-indexed as item 9)
  const selfHarmScore = itemScores[9] || 0
  
  if (selfHarmScore > 0) {
    return `Thank you for being honest in this screening. I noticed you indicated some thoughts of harming yourself. This is serious, and you deserve immediate support.

Please reach out now:
• National Suicide Prevention Lifeline: 988
• Postpartum Support International: 1-800-944-4773
• Crisis Text Line: Text HOME to 741741

These feelings are treatable, and help is available. Please talk to your healthcare provider as soon as possible. You are not alone, and things can get better with the right support.`
  }

  try {
    const riskLevel = score >= 13 ? 'high' : score >= 10 ? 'moderate' : 'low'
    
    const prompt = `A pregnant/postpartum woman just completed the Edinburgh Postnatal Depression Scale:
- Total score: ${score}/30
- Risk level: ${riskLevel}
- Score interpretation: ${score >= 13 ? 'Score suggests possible depression' : score >= 10 ? 'Borderline score - worth monitoring' : 'Within normal range'}

Provide a 2-3 sentence response that:
1. Thanks them for completing the screening
2. Explains what their score means in gentle, non-alarming terms
3. ${score >= 10 ? 'Encourages them to discuss with their healthcare provider' : 'Encourages continued self-care'}
4. Reminds them this is a screening tool, not a diagnosis

Be warm, supportive, and emphasize that seeking help is a sign of strength.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : getDefaultEPDSInsight(score)
  } catch (error) {
    console.error('AI EPDS Insight Error:', error)
    return getDefaultEPDSInsight(score)
  }
}

function getDefaultEPDSInsight(score: number): string {
  if (score >= 13) {
    return "Thank you for completing this screening. Your score suggests you may be experiencing symptoms of depression, which affects 1 in 4 women during pregnancy and postpartum. This is very treatable, and we encourage you to speak with your healthcare provider soon. Remember, reaching out for help is a sign of strength, not weakness."
  } else if (score >= 10) {
    return "Thank you for completing this screening. Your score is in the borderline range, which means it's worth keeping an eye on how you're feeling. Consider discussing these results with your healthcare provider at your next appointment. In the meantime, continue with self-care and don't hesitate to reach out if things feel harder."
  } else {
    return "Thank you for completing this screening. Your score is within the normal range, which is great news. Keep up with your self-care routine and continue to check in with yourself regularly. Remember, it's normal to have ups and downs during pregnancy, and support is always available if you need it."
  }
}

export async function generatePartnerMessage(
  userConcern: string,
  weekNumber?: number
): Promise<string> {
  try {
    const contextMessage = weekNumber 
      ? `[Context: The user is in week ${weekNumber} of their pregnancy]`
      : ''

    const prompt = `A pregnant woman${weekNumber ? ` in week ${weekNumber}` : ''} wants help communicating with her partner. She's feeling:

"${userConcern}"

Generate a thoughtful, empathetic message she can share with her partner. The message should:

1. Use "I" statements to express her feelings clearly
2. Explain what she's experiencing without blame
3. Ask for specific support she needs
4. Acknowledge that pregnancy is challenging for both partners
5. Be warm and open, inviting conversation
6. Keep it concise (2-3 short paragraphs max)

Write the message as if she's speaking directly to her partner. Make it feel authentic and from the heart.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      system: `You are helping a pregnant woman communicate her feelings to her partner. Be empathetic, clear, and supportive. Help her express herself authentically.`,
      messages: [{ 
        role: 'user', 
        content: contextMessage ? `${contextMessage}\n\n${prompt}` : prompt 
      }]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : getDefaultPartnerMessage(userConcern)
  } catch (error) {
    console.error('AI Partner Message Error:', error)
    return getDefaultPartnerMessage(userConcern)
  }
}

function getDefaultPartnerMessage(concern: string): string {
  return `I wanted to share something with you that's been on my mind. ${concern}

I know pregnancy can be challenging for both of us, and I want us to be able to talk about what I'm experiencing. I'd really appreciate your support and understanding right now. 

Can we find a good time to talk about this? I value our connection and want to make sure we're both feeling supported through this journey.`
}
