import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    logger.apiCall('/api/community/posts', 'GET');

    // Mock-Community-Posts
    const posts = [
      {
        id: 'post-1',
        userId: 'user-1',
        username: 'Luna_Moon',
        avatar: '/avatars/luna.jpg',
        title: 'Meine Erfahrung mit Human Design',
        content: 'Seit ich mein Human Design kenne, verstehe ich mich so viel besser. Als Generator habe ich gelernt, auf mein Sakral-Zentrum zu hören.',
        category: 'experience',
        tags: ['Human Design', 'Generator', 'Erfahrung'],
        likes: 23,
        comments: 8,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 Stunden alt
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-2',
        userId: 'user-2',
        username: 'Soul_Seeker',
        avatar: '/avatars/soul.jpg',
        title: 'Mondkalender und Pflanzen',
        content: 'Ich habe angefangen, meinen Garten nach dem Mondkalender zu pflegen. Die Ergebnisse sind erstaunlich!',
        category: 'gardening',
        tags: ['Mondkalender', 'Garten', 'Pflanzen'],
        likes: 15,
        comments: 5,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 Stunden alt
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'post-3',
        userId: 'user-3',
        username: 'Wisdom_Keeper',
        avatar: '/avatars/wisdom.jpg',
        title: 'Beziehungen und Human Design',
        content: 'Wie Human Design mir geholfen hat, meine Beziehung zu verstehen und zu verbessern.',
        category: 'relationships',
        tags: ['Beziehungen', 'Kompatibilität', 'Human Design'],
        likes: 31,
        comments: 12,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 Tag alt
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Pagination anwenden
    const paginatedPosts = posts.slice(offset, offset + limit);

    logger.info('Community posts fetched successfully', { 
      count: paginatedPosts.length,
      total: posts.length,
      limit,
      offset 
    });

    return NextResponse.json({
      success: true,
      posts: paginatedPosts,
      total: posts.length,
      limit,
      offset,
      hasMore: offset + limit < posts.length
    });

  } catch (error) {
    logger.error('Failed to fetch community posts', error);
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content, category, tags } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: 'User ID, title, and content are required' },
        { status: 400 }
      );
    }

    logger.apiCall('/api/community/posts', 'POST');

    // Mock-Post erstellen
    const newPost = {
      id: `post-${Date.now()}`,
      userId,
      username: 'Current_User', // TODO: Echte Username aus Supabase
      avatar: '/avatars/default.jpg',
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logger.info('Community post created successfully', { 
      userId, 
      postId: newPost.id,
      title: title.substring(0, 50)
    });

    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'Post created successfully'
    });

  } catch (error) {
    logger.error('Failed to create community post', error);
    return NextResponse.json(
      { error: 'Failed to create community post' },
      { status: 500 }
    );
  }
}
