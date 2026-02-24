export interface IReadLog {
  id: string;
  articleId: string;
  readerId: string | null;
  readAt: Date;
}

export interface IReadLogWithRelations extends IReadLog {
  article?: {
    id: string;
    title: string;
    category: string;
  };
  reader?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export class ReadLog {
  id: string;
  articleId: string;
  readerId: string | null;
  readAt: Date;

  constructor(data: IReadLog) {
    this.id = data.id;
    this.articleId = data.articleId;
    this.readerId = data.readerId;
    this.readAt = data.readAt;
  }

  // Check if read is from authenticated user
  isAuthenticatedRead(): boolean {
    return this.readerId !== null;
  }

  // Get read date in GMT
  getReadDateGMT(): Date {
    const date = new Date(this.readAt);
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  }
}

export type CreateReadLogDTO = {
  articleId: string;
  readerId?: string | null;
  readAt?: Date;
};

export type ReadLogResponse = IReadLog;

// For rate limiting
export interface ReadRateLimitInfo {
  count: number;
  firstReadAt: Date;
  lastReadAt: Date;
}

export class ReadRateLimit {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly count: number,
    public readonly windowStart: Date
  ) {}

  // Check if within rate limit window (10 seconds)
  isWithinWindow(currentTime: Date = new Date()): boolean {
    const windowMs = 10 * 1000; // 10 seconds
    return currentTime.getTime() - this.windowStart.getTime() <= windowMs;
  }

  // Check if rate limit exceeded (max 5 reads per window)
  isExceeded(): boolean {
    return this.count > 5;
  }
}