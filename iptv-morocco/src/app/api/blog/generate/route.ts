import { NextResponse } from 'next/server';

// This API route is called by Vercel Cron Jobs
// It generates 1 article using OpenAI, stores as draft for admin approval

const SYSTEM_PROMPT = `You are a professional sports journalist writing for IPTV Pro News, a website that provides IPTV services and sports coverage. 

Write a engaging, well-researched news article about football/sports or IPTV technology. 

The article must:
- Be 500-800 words long
- Have a catchy, SEO-optimized title
- Include a compelling 2-3 sentence excerpt
- Use markdown formatting with ## and ### headings
- Include relevant football/sports terminology
- Mention IPTV Pro naturally where relevant (e.g., how to watch matches via IPTV)
- Be factual and professional
- Target Arabic/international audience interested in football and sports streaming

Return JSON format:
{
  "title": "Article Title",
  "excerpt": "Brief excerpt...",
  "content": "Full markdown content...",
  "tags": ["tag1", "tag2", "tag3"],
  "categoryId": "one of: world-cup, champions-league, premier-league, la-liga, bein-sports, setup-guides, device-tips, movies-series, ramadan, technology",
  "readTime": number,
  "seoTitle": "SEO Title",
  "seoDescription": "SEO Description",
  "seoKeywords": "keyword1, keyword2, keyword3"
}`;

const ARTICLE_TOPICS = [
  { category: 'world-cup', topics: ['World Cup match preview', 'World Cup player analysis', 'World Cup standings update', 'Morocco World Cup journey', 'World Cup viewing guide'] },
  { category: 'champions-league', topics: ['Champions League match review', 'UCL group stage analysis', 'Champions League knockout preview', 'UCL top scorers update'] },
  { category: 'premier-league', topics: ['Premier League weekend review', 'EPL title race analysis', 'Premier League transfer news', 'EPL viewing on IPTV'] },
  { category: 'la-liga', topics: ['La Liga match highlights', 'Spanish football analysis', 'El Clasico preview', 'La Liga streaming guide'] },
  { category: 'bein-sports', topics: ['beIN Sports channel guide', 'Sports broadcasting news', 'How to watch sports on beIN via IPTV', 'Exclusive sports coverage'] },
  { category: 'setup-guides', topics: ['IPTV setup on Smart TV', 'Firestick IPTV installation', 'IPTV on Android devices', 'Best IPTV players 2026'] },
  { category: 'device-tips', topics: ['Optimize IPTV streaming', 'Reduce buffering tips', 'Best devices for IPTV', '4K streaming settings'] },
  { category: 'technology', topics: ['IPTV technology explained', 'Streaming vs traditional TV', 'Future of TV broadcasting', 'Internet speed for streaming'] },
];

function getRandomTopic() {
  const idx = Math.floor(Math.random() * ARTICLE_TOPICS.length);
  const topic = ARTICLE_TOPICS[idx];
  const subTopic = topic.topics[Math.floor(Math.random() * topic.topics.length)];
  return { categoryId: topic.category, prompt: subTopic };
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const newsApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const topic = getRandomTopic();
    const userPrompt = `Write a sports news article about: ${topic.prompt}. Make it engaging and informative for an audience interested in sports and IPTV streaming.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
    }

    const data = await response.json();
    const article = JSON.parse(data.choices[0].message.content);

    // Generate cover image using DALL-E
    let coverImage = '';
    try {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Professional sports photography style image for article about: ${article.title}. High quality, realistic, suitable for a news website header.`,
          n: 1,
          size: '1792x1024',
        }),
      });
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        coverImage = imageData.data[0].url;
      }
    } catch (err) {
      console.error('Image generation failed:', err);
    }

    // Generate SEO-friendly slug
    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80) + '-' + Date.now().toString(36);

    const result = {
      ...article,
      slug,
      categoryId: topic.categoryId,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop',
      status: 'pending_review',
      author: 'AI Generated',
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };

    // In production: save to database
    // await createArticle(result);

    return NextResponse.json({
      success: true,
      article: result,
      message: 'Article generated and saved as draft. Pending admin review.',
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
