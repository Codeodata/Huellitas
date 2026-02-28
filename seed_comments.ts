import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://yyaoctatrgvgdtviyhcq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YW9jdGF0cmd2Z2R0dml5aGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE2Mjk0OSwiZXhwIjoyMDg3NzM4OTQ5fQ.JDbw0CiAiPJcKHTZd_f9C8kmttqZ7Fua-zBQ0ppoVnU', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const commentsByType = {
  lost: [
    'I saw a dog matching that description near the mall yesterday! Can you describe the collar?',
    'I can help search around the area this evening. When exactly did he go missing?',
    'Please share this with local pet groups. Hope you find your furry friend soon!',
    'I have experience with lost dogs. Would you like me to help set up a search grid?',
    'Consider posting on local Facebook groups and NextDoor. More eyes means better chances!',
    'I\'ll keep an eye out during my morning jog tomorrow. What\'s his name?',
    'That\'s so scary! Is he microchipped? Contact your vet to alert them.',
    'My neighbor runs a pet rescue. Let me ask if they\'ve seen anything.',
    'Have you tried putting his favorite blanket outside? The scent can help him find home.',
    'I can share this with my colleagues at the office near there.',
    'Check if there are any security cameras in the area that might have caught him.',
    'I saw a golden retriever near the park around 5pm yesterday. Could that be him?',
    'Please update if you get any leads. Will keep checking my neighborhood.',
    'Consider making flyers with a clear photo. Distribute them within a 2-mile radius.',
    'Good luck! The pet community is amazing and will definitely help!',
  ],
  found: [
    'I can help foster this pet until we find the owner. Do you need a temporary home?',
    'Have you checked if the pet has a microchip? Most vets can scan for free.',
    'I can post this on our local lost and found pet group. What\'s your location?',
    'Take the pet to a vet to check for a microchip. That\'s the best way to find the owner!',
    'I know a great rescue organization if you need help. Very trustworthy people.',
    'Can you describe any distinctive marks? That will help identify the owner.',
    'I can share this with my neighborhood group on WhatsApp.',
    'Please keep me updated! I have connections with local shelters too.',
    'Is the pet friendly? Could be a good candidate for adoption if no owner is found.',
    'I have a spare crate and food if you need supplies for the rescue.',
    'Consider posting on Instagram with location tags. Works wonders!',
    'I can help with transportation if you need to take them to a vet.',
    'My sister works at a pet store. I can ask if anyone\'s looking for a lost pet.',
    'This is such a kind thing to do. Thank you for helping this animal!',
    'Let me know if you need any help with posting flyers around town.',
  ],
  sitter_needed: [
    'I\'m available! I have 5 years of experience with dogs and cats. What are the details?',
    'How many pets do you have? I specialize in dog walking and pet sitting.',
    'I can provide references from my previous pet sitting clients.',
    'Do you need someone for just feeding or full-time care? I\'m flexible.',
    'I have pet first aid training and can handle anxious animals.',
    'What\'s the location? I live nearby and can do drop-in visits.',
    'I\'m a vet student so I\'m comfortable with pets that need medication.',
    'Do you have any specific requirements? I\'m happy to follow your routines.',
    'I can send daily photo updates while you\'re away. Would that help?',
    'What\'s the hourly rate? I\'m flexible on pricing for good clients.',
    'I have my own transportation so distance isn\'t an issue.',
    'I specialize in senior pets and have lots of patience.',
    'Are the pets good with other animals? I have a dog-friendly cat.',
    'I can do overnights if needed. Your pets would never be alone!',
    'What are their favorite activities? I\'d love to keep their routine going.',
  ]
}

async function seedComments() {
  console.log('💬 Seeding unique comments...')
  
  // Get all users
  const { data: users } = await supabase.auth.admin.listUsers()
  const userIds = users?.users.map(u => u.id) || []
  
  // Get all posts with their types
  const { data: posts } = await supabase
    .from('posts')
    .select('id, type, author_id')
    .order('created_at', { ascending: true })
  
  if (!posts || posts.length === 0) {
    console.log('No posts found!')
    return
  }
  
  console.log(`Found ${posts.length} posts`)
  
  let commentCount = 0
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    const availableComments = commentsByType[post.type as keyof typeof commentsByType]
    
    // Add 2 unique comments per post (skip if same author)
    for (let c = 0; c < 2; c++) {
      const userIndex = (i + c + 1) % userIds.length
      const commentIndex = (i * 2 + c) % availableComments.length
      
      // Skip if commenting on own post
      if (userIds[userIndex] !== post.author_id) {
        await supabase.from('comments').insert({
          post_id: post.id,
          author_id: userIds[userIndex],
          content: availableComments[commentIndex]
        })
        commentCount++
      }
    }
    
    console.log(`  Post ${i + 1}/${posts.length} - added comments`)
  }
  
  console.log(`✅ Created ${commentCount} unique comments!`)
}

seedComments().catch(console.error)
