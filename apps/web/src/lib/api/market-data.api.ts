import {
  Asset,
  GetHistoricalSymbolBarsDto,
  NewsResponseType,
  StockBarsResponseType,
} from '@finlerk/shared';
import { ApiClient, ApiConfig } from './api-client';

export class MarketDataApi extends ApiClient {
  constructor(config?: ApiConfig) {
    super(config);
    this.getNews = this.getNews.bind(this);
    this.getHistoricalBars = this.getHistoricalBars.bind(this);
  }

  async getNews(): Promise<NewsResponseType> {
    const response = await this.get<NewsResponseType>(
      '/api/v1/market-data/news',
    );
    return response.data;
  }

  async assetsFetcher(url: string): Promise<Asset[]> {
    const response = await this.get<Asset[]>(url);
    return response.data;
  }

  async getHistoricalBars({
    url,
    ...params
  }: Omit<
    GetHistoricalSymbolBarsDto & {
      url: string;
    },
    'symbol'
  >): Promise<StockBarsResponseType> {
    const response = await this.get<StockBarsResponseType>(url, {
      params,
    });
    return response.data;
  }
}

export const marketDataApi = new MarketDataApi();
