import prisma from '../config/database';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { ArticleStatus } from '@prisma/client';

export class ArticleService {
  async createArticle(authorId: string, data: {
    title: string;
    content: string;
    category: string;
    status?: ArticleStatus;
  }) {
    const article = await prisma.article.create({
      data: {
        ...data,
        authorId,
        status: data.status || ArticleStatus.Draft
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return article;
  }

  async getAuthorArticles(authorId: string, includeDeleted: boolean = false) {
    const where: any = { authorId };
    
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return articles;
  }

  async getArticleById(articleId: string, includeDeleted: boolean = false) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!article || (!includeDeleted && article.deletedAt)) {
      throw new NotFoundError('News article no longer available');
    }

    return article;
  }

  async updateArticle(articleId: string, authorId: string, data: {
    title?: string;
    content?: string;
    category?: string;
    status?: ArticleStatus;
  }) {
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article || article.deletedAt) {
      throw new NotFoundError('Article not found');
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenError('You can only edit your own articles');
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedArticle;
  }

  async softDeleteArticle(articleId: string, authorId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article || article.deletedAt) {
      throw new NotFoundError('Article not found');
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenError('You can only delete your own articles');
    }

    const deletedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return deletedArticle;
  }

  async getPublishedArticles(filters: {
    category?: string;
    author?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, author, q, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ArticleStatus.Published,
      deletedAt: null
    };

    if (category) {
      where.category = category;
    }

    if (author) {
      where.author = {
        name: {
          contains: author,
          mode: 'insensitive'
        }
      };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.article.count({ where })
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}