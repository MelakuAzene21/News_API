import { ArticleStatus, Role } from '@prisma/client';

export interface IArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  status: ArticleStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IArticleWithAuthor extends IArticle {
  author: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export class Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: ArticleStatus;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: IArticle) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.category = data.category;
    this.status = data.status;
    this.authorId = data.authorId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  // Check if article is deleted
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // Check if article is published
  isPublished(): boolean {
    return this.status === ArticleStatus.Published && !this.isDeleted();
  }

  // Validate title length
  static validateTitle(title: string): boolean {
    return title.length >= 1 && title.length <= 150;
  }

  // Validate content length
  static validateContent(content: string): boolean {
    return content.length >= 50;
  }

  // Validate category
  static validateCategory(category: string): boolean {
    const validCategories = ['Politics', 'Tech', 'Sports', 'Health'];
    return validCategories.includes(category);
  }
}

export type CreateArticleDTO = {
  title: string;
  content: string;
  category: string;
  status?: ArticleStatus;
};

export type UpdateArticleDTO = Partial<CreateArticleDTO>;

export type ArticleFilters = {
  category?: string;
  author?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type ArticleResponse = IArticle;