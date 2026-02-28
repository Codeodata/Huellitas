import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yyaoctatrgvgdtviyhcq.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YW9jdGF0cmd2Z2R0dml5aGNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE2Mjk0OSwiZXhwIjoyMDg3NzM4OTQ5fQ.JDbw0CiAiPJcKHTZd_f9C8kmttqZ7Fua-zBQ0ppoVnU'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const users = [
  { email: 'john@example.com', password: 'password123', username: 'john_pets' },
  { email: 'sarah@example.com', password: 'password123', username: 'sarah_lover' },
  { email: 'mike@example.com', password: 'password123', username: 'mike_dog' },
  { email: 'emma@example.com', password: 'password123', username: 'emma_kitty' },
  { email: 'david@example.com', password: 'password123', username: 'david_runner' },
]

const pets = [
  { name: 'Max', type: 'dog', breed: 'Golden Retriever', description: 'Friendly and loves to play fetch. Very energetic!' },
  { name: 'Luna', type: 'cat', breed: 'Siamese', description: 'Quiet and affectionate. Loves sunny spots.' },
  { name: 'Buddy', type: 'dog', breed: 'Labrador', description: 'Great with kids. Loves swimming!' },
  { name: 'Whiskers', type: 'cat', breed: 'Persian', description: 'Fluffy and loves cuddles. Very calm.' },
  { name: 'Charlie', type: 'dog', breed: 'Beagle', description: 'Curious explorer. Great sense of smell.' },
  { name: 'Milo', type: 'cat', breed: 'Maine Coon', description: 'Big and fluffy. Very gentle giant.' },
  { name: 'Rocky', type: 'dog', breed: 'German Shepherd', description: 'Loyal and protective. Great guard dog.' },
  { name: 'Simba', type: 'cat', breed: 'British Shorthair', description: 'Playful and loves toys. Independent but sweet.' },
  { name: 'Cooper', type: 'dog', breed: 'Bulldog', description: 'Cuddly and lazy. Loves belly rubs.' },
  { name: 'Bella', type: 'dog', breed: 'Poodle', description: 'Smart and elegant. Loves grooming.' },
]

const locations = [
  { lat: -6.2808, lng: 106.9835, address: 'Bekasi, West Java' },
  { lat: -6.2000, lng: 106.8500, address: 'Jakarta Selatan' },
  { lat: -6.1751, lng: 106.8650, address: 'Jakarta Pusat' },
  { lat: -6.1400, lng: 106.8100, address: 'Jakarta Barat' },
  { lat: -6.1200, lng: 106.9000, address: 'Jakarta Timur' },
  { lat: -6.2500, lng: 106.8300, address: 'Tangerang' },
  { lat: -6.3100, lng: 106.9500, address: 'Depok' },
  { lat: -6.3500, lng: 106.9000, address: 'Bogor' },
]

const postTitles = {
  lost: [
    'Lost Golden Retriever near Mall!',
    'Missing Siamese Cat - Last Seen at Park',
    'Help! My Beagle Got Away',
    'Lost Persian Cat - Answers to Whiskers',
    'Missing Labrador - Brown with White Chest',
  ],
  found: [
    'Found Stray Dog Near Highway',
    'Found Cat - Orange Tabby',
    'Rescued Injured Dog - Needs Home',
    'Found: Friendly Poodle Wandering',
    'Found: Cute Kitten Need Owner',
  ],
  sitter_needed: [
    'Need Pet Sitter for Weekend Trip',
    'Looking for Dog Walker - Morning & Evening',
    'Urgent: Need Cat Sitter for 1 Week',
    'Seeking Reliable Pet Sitter for Holiday',
    'Need Someone to Feed Cat While on Vacation',
  ]
}

const postDescriptions = {
  lost: [
    'My beloved dog escaped from the backyard this morning. He is very friendly but might be scared. Please contact me if you see him! He was last seen wearing a blue collar with tags.',
    'My indoor cat somehow got out last night. She is very shy around strangers but might come if you offer food. Please help me find her!',
    'My dog slipped his leash during our morning walk. He is not dangerous but might run if approached. Please call immediately if spotted!',
    'My cat got scared by fireworks and ran away. She has a microchip but no collar. White Persian with brown patches.',
    'My dog was stolen from my car parked at the mall. There was a break-in. Please help if you have any information.',
  ],
  found: [
    'I found this sweet dog wandering near the highway. No collar or tags. Very friendly and well-behaved. I cannot keep him but can foster until we find his owner.',
    'This cat has been hanging around my house for 3 days. Seems well-fed so probably has an owner. Very affectionate. Taking to vet tomorrow.',
    'Found an injured dog on the street. Took to clinic for treatment. Looking for owner or new home. Very gentle soul.',
    'Found this poodle at the park. Clean and groomed so definitely someone\'s pet. No tags but wearing a pink bow.',
    'Tiny kitten found in box near supermarket. No mother around. Need to find home quickly as I have 2 dogs at home.',
  ],
  sitter_needed: [
    'Going out of town for business. Need someone to stay at my place and care for my dog. 3 days, can pay well.',
    'Looking for reliable dog walker for my 2 dogs. Morning 7am and evening 6pm. About 30 min each walk.',
    'Need cat sitter for 1 week while on holiday. Must feed twice daily, clean litter, and give medications. Willing to pay extra for reliable person.',
    'My elderly parent needs help caring for their dog while I\'m away. Just need someone to visit twice daily for 2 weeks.',
    'Seeking pet sitter for my anxious rescue dog. Needs patient person who understands anxious dogs. 5 days over Christmas.',
  ]
}

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

async function seed() {
  console.log('🌱 Starting seed...')
  
  const userIds: string[] = []
  
  // Create users
  console.log('👤 Creating users...')
  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { username: user.username }
      })
      
      if (error) {
        console.log(`User ${user.email} might already exist:`, error.message)
        // Try to get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const found = existingUser?.users.find(u => u.email === user.email)
        if (found) {
          userIds.push(found.id)
          console.log(`  ✓ Using existing user: ${user.email}`)
        }
      } else if (data.user) {
        userIds.push(data.user.id)
        console.log(`  ✓ Created user: ${user.email}`)
      }
    } catch (err) {
      console.log(`Error creating user ${user.email}:`, err)
    }
  }
  
  if (userIds.length === 0) {
    console.log('❌ No users created. Exiting.')
    return
  }
  
  // Create profiles
  console.log('👥 Creating profiles...')
  for (let i = 0; i < userIds.length; i++) {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userIds[i],
        username: users[i].username,
        avatar_url: null
      }, { onConflict: 'id' })
    
    if (!error) {
      console.log(`  ✓ Created profile: ${users[i].username}`)
    }
  }
  
  // Create pets
  console.log('🐾 Creating pets...')
  const petIds: string[] = []
  for (let i = 0; i < pets.length; i++) {
    const pet = pets[i]
    const ownerIndex = i % userIds.length
    
    const { data, error } = await supabase
      .from('pets')
      .insert({
        owner_id: userIds[ownerIndex],
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        description: pet.description
      })
      .select()
      .single()
    
    if (data) {
      petIds.push(data.id)
      console.log(`  ✓ Created pet: ${pet.name} (${pet.type})`)
    }
  }
  
  // Create posts
  console.log('📝 Creating posts...')
  const postIds: string[] = []
  const postTypes: ('lost' | 'found' | 'sitter_needed')[] = ['lost', 'found', 'sitter_needed']
  
  for (let i = 0; i < 15; i++) {
    const typeIndex = i % 3
    const postType = postTypes[typeIndex]
    const userIndex = i % userIds.length
    const locationIndex = i % locations.length
    
    const titles = postTitles[postType]
    const descriptions = postDescriptions[postType]
    const titleIndex = i % titles.length
    const descIndex = i % descriptions.length
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userIds[userIndex],
        type: postType,
        pet_id: petIds[i % petIds.length] || null,
        title: titles[titleIndex],
        description: descriptions[descIndex],
        latitude: locations[locationIndex].lat + (Math.random() - 0.5) * 0.02,
        longitude: locations[locationIndex].lng + (Math.random() - 0.5) * 0.02,
        address: locations[locationIndex].address,
        status: i < 12 ? 'active' : 'resolved',
        contact_email: users[userIndex].email,
        contact_phone: '+6281' + Math.floor(Math.random() * 1000000000),
      })
      .select()
      .single()
    
    if (data) {
      postIds.push(data.id)
      console.log(`  ✓ Created post: ${titles[titleIndex]} (${postType})`)
    }
  }
  
  // Create comments - 2 comments per post
  console.log('💬 Creating comments...')
  let commentCount = 0
  
  for (let postIndex = 0; postIndex < postIds.length; postIndex++) {
    // Get the post type to use appropriate comments
    const { data: post } = await supabase
      .from('posts')
      .select('type')
      .eq('id', postIds[postIndex])
      .single()
    
    const postType = post?.type || 'lost'
    const availableComments = commentsByType[postType as keyof typeof commentsByType]
    
    // Add 2 unique comments per post
    for (let c = 0; c < 2; c++) {
      const userIndex = (commentCount + c + 1) % userIds.length
      const commentIndex = (commentCount + c) % availableComments.length
      
      await supabase
        .from('comments')
        .insert({
          post_id: postIds[postIndex],
          author_id: userIds[userIndex],
          content: availableComments[commentIndex]
        })
      
      commentCount++
      console.log(`  ✓ Created comment ${commentCount}/30`)
    }
  }
  
  // Create notifications
  console.log('🔔 Creating notifications...')
  for (let i = 0; i < 10; i++) {
    const postIndex = i % postIds.length
    const userIndex = (i + 2) % userIds.length
    
    await supabase
      .from('notifications')
      .insert({
        user_id: userIds[userIndex],
        type: 'comment',
        post_id: postIds[postIndex],
        from_user_id: userIds[(i + 1) % userIds.length],
        message: `@${users[(i + 1) % userIds.length].username} commented on your post`,
        read: i > 5
      })
    
    console.log(`  ✓ Created notification ${i + 1}/10`)
  }
  
  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📋 Test accounts:')
  for (const user of users) {
    console.log(`   Email: ${user.email} | Password: ${user.password}`)
  }
}

seed().catch(console.error)
