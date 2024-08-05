import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { Calculator } from '@langchain/community/tools/calculator';

export const searchTool = new TavilySearchResults({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 1,
});

export const calculatorTool = new Calculator();
