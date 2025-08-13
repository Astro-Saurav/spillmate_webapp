import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  GOOGLE_GEMINI_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  MOCHA_USERS_SERVICE_API_KEY: string
  MOCHA_USERS_SERVICE_API_URL: string
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Profile API
app.get('/api/profile', async (c) => {
  const userId = c.req.query('user_id')
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE id = ?'
    ).bind(userId).all()

    if (results.length === 0) {
      return c.json({ error: 'Profile not found' }, 404)
    }

    return c.json(results[0])
  } catch (error) {
    console.error('Error fetching profile:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.post('/api/profile', async (c) => {
  try {
    const { id, email, role } = await c.req.json()

    const { success } = await c.env.DB.prepare(
      'INSERT INTO profiles (id, email, role) VALUES (?, ?, ?)'
    ).bind(id, email, role || 'free_user').run()

    if (success) {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM profiles WHERE id = ?'
      ).bind(id).all()

      return c.json(results[0])
    }

    return c.json({ error: 'Failed to create profile' }, 500)
  } catch (error) {
    console.error('Error creating profile:', error)
    return c.json({ error: 'Failed to create profile' }, 500)
  }
})

// Inject environment variables into HTML
app.get('/', async (c) => {
  const html = await fetch(new URL('./index.html', import.meta.url)).then(res => res.text())
  
  // Safely inject environment variables with fallbacks
  const supabaseUrl = c.env.SUPABASE_URL || 'https://uvwumljcocwadrnfruul.supabase.co'
  const supabaseKey = c.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2d3VtbGpjb2N3YWRybmZydXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTQxNDYsImV4cCI6MjA3MDU5MDE0Nn0.1nExsteEj77IvJEOjZ8o_RouL9Nwu3DAFL5sZUX0PKg'
  
  const injectedHtml = html.replace(
    '<script type="module" src="/src/react-app/main.tsx"></script>',
    `<script>
      window.__SUPABASE_URL__ = "${supabaseUrl}";
      window.__SUPABASE_ANON_KEY__ = "${supabaseKey}";
    </script>
    <script type="module" src="/src/react-app/main.tsx"></script>`
  )
  
  return c.html(injectedHtml)
})

// Conversations API
app.get('/api/conversations', async (c) => {
  const userId = c.req.query('user_id')
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()

    const conversations = results.map(conv => ({
      ...conv,
      messages: JSON.parse(conv.messages as string || '[]')
    }))

    return c.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return c.json({ error: 'Failed to fetch conversations' }, 500)
  }
})

app.post('/api/conversations', async (c) => {
  try {
    const { user_id, title, mood_before } = await c.req.json()

    const { success } = await c.env.DB.prepare(
      'INSERT INTO conversations (user_id, title, messages, mood_before) VALUES (?, ?, ?, ?)'
    ).bind(user_id, title, '[]', mood_before).run()

    if (success) {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
      ).bind(user_id).all()

      const conversation = results[0]
      return c.json({
        ...conversation,
        messages: JSON.parse(conversation.messages as string || '[]')
      })
    }

    return c.json({ error: 'Failed to create conversation' }, 500)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return c.json({ error: 'Failed to create conversation' }, 500)
  }
})

// Chat API
app.post('/api/chat', async (c) => {
  try {
    const { conversation_id, message, user_id } = await c.req.json()

    // Get conversation
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?'
    ).bind(conversation_id, user_id).all()

    if (results.length === 0) {
      return c.json({ error: 'Conversation not found' }, 404)
    }

    const conversation = results[0]
    const messages = JSON.parse(conversation.messages as string || '[]')

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    messages.push(userMessage)

    // Generate AI response using Gemini
    const aiResponse = await generateAIResponse(message, c.env.GOOGLE_GEMINI_API_KEY)
    
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    }
    messages.push(assistantMessage)

    // Update conversation
    await c.env.DB.prepare(
      'UPDATE conversations SET messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(JSON.stringify(messages), conversation_id).run()

    return c.json(assistantMessage)
  } catch (error) {
    console.error('Error in chat:', error)
    return c.json({ error: 'Failed to process message' }, 500)
  }
})

// Mood API
app.post('/api/mood', async (c) => {
  try {
    const { user_id, mood_rating, notes } = await c.req.json()

    const { success } = await c.env.DB.prepare(
      'INSERT INTO mood_logs (user_id, mood_rating, notes) VALUES (?, ?, ?)'
    ).bind(user_id, mood_rating, notes || null).run()

    if (success) {
      return c.json({ success: true })
    }

    return c.json({ error: 'Failed to log mood' }, 500)
  } catch (error) {
    console.error('Error logging mood:', error)
    return c.json({ error: 'Failed to log mood' }, 500)
  }
})

app.get('/api/mood', async (c) => {
  const userId = c.req.query('user_id')
  if (!userId) {
    return c.json({ error: 'User ID required' }, 400)
  }

  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 30'
    ).bind(userId).all()

    return c.json(results)
  } catch (error) {
    console.error('Error fetching mood logs:', error)
    return c.json({ error: 'Failed to fetch mood logs' }, 500)
  }
})

// Admin APIs
app.get('/api/admin/stats', async (c) => {
  try {
    const [users, conversations, moods] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM profiles').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM conversations').first(),
      c.env.DB.prepare('SELECT AVG(mood_rating) as avg FROM mood_logs').first()
    ])

    const userCount = (users as any)?.count || 0
    const conversationCount = (conversations as any)?.count || 0
    const avgMood = (moods as any)?.avg || 5.0

    return c.json({
      totalUsers: userCount,
      activeUsers: Math.floor(userCount * 0.3), // Mock 30% active
      totalConversations: conversationCount,
      flaggedContent: 0, // Mock
      averageMood: avgMood
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

app.get('/api/admin/users', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, COUNT(c.id) as conversation_count 
      FROM profiles p 
      LEFT JOIN conversations c ON p.id = c.user_id 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `).all()

    return c.json(results)
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

app.get('/api/admin/flagged-content', async (c) => {
  // Mock empty array - would implement real flagging system
  return c.json([])
})

app.put('/api/admin/users/role', async (c) => {
  try {
    const { userId, role } = await c.req.json()

    const { success } = await c.env.DB.prepare(
      'UPDATE profiles SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(role, userId).run()

    if (success) {
      return c.json({ success: true })
    }

    return c.json({ error: 'Failed to update role' }, 500)
  } catch (error) {
    console.error('Error updating user role:', error)
    return c.json({ error: 'Failed to update role' }, 500)
  }
})

// Generate AI response using Gemini
async function generateAIResponse(userMessage: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a compassionate AI mental health companion called Spillmate. You provide empathetic, supportive responses to users seeking emotional support. Always be:

1. Empathetic and non-judgmental
2. Supportive but not prescriptive
3. Encouraging of professional help when appropriate
4. Respectful of user's feelings and experiences
5. Focused on emotional support and coping strategies

If the user expresses thoughts of self-harm or suicide, acknowledge their pain, express care, and gently encourage them to seek immediate professional help or contact crisis resources.

User message: ${userMessage}

Respond with warmth, empathy, and appropriate mental health support:`,
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    const data = await response.json() as any
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text
    }

    return "I'm here to listen and support you. Could you tell me more about what you're experiencing right now?"
  } catch (error) {
    console.error('Error generating AI response:', error)
    return "I'm experiencing some technical difficulties right now, but I want you to know that I'm here for you. How can I best support you today?"
  }
}

// Serve static files - will be handled by Vite in development
app.get('*', async (c) => {
  return c.text('Not found', 404)
})

export default app
