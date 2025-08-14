// Development Toast Service for AI Query Debugging
// Only active in development mode

export interface AIQueryData {
  id: string;
  timestamp: Date;
  query: string;
  context: string;
  tokenCount?: number;
  responseTokens?: number;
}

export type ToastListener = (queries: AIQueryData[]) => void;

class DevToastService {
  private static instance: DevToastService;
  private queries: AIQueryData[] = [];
  private listeners: ToastListener[] = [];
  private isDevelopment: boolean;

  private constructor() {
    // Only enable in development
    this.isDevelopment = import.meta.env.DEV;
  }

  static getInstance(): DevToastService {
    if (!DevToastService.instance) {
      DevToastService.instance = new DevToastService();
    }
    return DevToastService.instance;
  }

  logAIQuery(query: string, context: string, tokenCount?: number): string {
    if (!this.isDevelopment) return '';

    const queryData: AIQueryData = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      query,
      context,
      tokenCount
    };

    this.queries.unshift(queryData); // Add to beginning
    
    // Keep only last 10 queries
    if (this.queries.length > 10) {
      this.queries = this.queries.slice(0, 10);
    }

    this.notifyListeners();
    return queryData.id;
  }

  updateQueryWithResponse(queryId: string, responseTokens: number): void {
    if (!this.isDevelopment || !queryId) return;

    const query = this.queries.find(q => q.id === queryId);
    if (query) {
      query.responseTokens = responseTokens;
      this.notifyListeners();
    }
  }

  dismissQuery(queryId: string): void {
    if (!this.isDevelopment) return;

    this.queries = this.queries.filter(q => q.id !== queryId);
    this.notifyListeners();
  }

  subscribe(listener: ToastListener): () => void {
    if (!this.isDevelopment) return () => {};

    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.queries]));
  }

  clearAll(): void {
    if (!this.isDevelopment) return;
    
    this.queries = [];
    this.notifyListeners();
  }

  getQueries(): AIQueryData[] {
    return [...this.queries];
  }

  isDev(): boolean {
    return this.isDevelopment;
  }
}

export const devToastService = DevToastService.getInstance();
