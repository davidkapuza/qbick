import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from './market-data.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { GetBarsDto } from './dtos/get-bars.dto';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('MarketData')
@Controller({
  path: 'market-data',
  version: '1',
})
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3000)
  @Get('news')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'symbols',
    type: 'string',
    required: false,
    example: 'TSLA,AAPL',
  })
  getNews(
    @Query(
      'symbols',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    symbols: string[] = [],
  ) {
    return this.marketDataService.getNews(symbols);
  }

  @Get('stock-bars')
  @HttpCode(HttpStatus.OK)
  getHistoricalBars(@Query() getBarsDto: GetBarsDto) {
    return this.marketDataService.getStockBars(getBarsDto);
  }

  @Get('latest-trades')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'symbols',
    type: 'string',
    example: 'TSLA,AAPL',
    required: false,
  })
  getLatestTrades(
    @Query(
      'symbols',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    symbols: string[] = [],
  ) {
    return this.marketDataService.getLatestTrades(symbols);
  }

  @Get('latest-quotes')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'symbols',
    type: 'string',
    example: 'TSLA,AAPL',
  })
  getLatestQuotes(
    @Query('symbols', new ParseArrayPipe({ items: String, separator: ',' }))
    symbols: string[],
  ) {
    return this.marketDataService.getLatestQuotes(symbols);
  }

  @Get('trades')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'symbol',
    type: 'string',
    example: 'TSLA',
  })
  getTrades(
    @Query('symbol')
    symbol: string,
  ) {
    return this.marketDataService.getTrades(symbol);
  }

  @Get('most-active')
  @HttpCode(HttpStatus.OK)
  mostActive() {
    return this.marketDataService.mostActive();
  }
}