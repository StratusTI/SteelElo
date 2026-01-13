import { ApiReference } from '@scalar/nextjs-api-reference';

const config = {
  url: 'https://elo.stratustelecom.com.br:44385/openapi.json',
  theme: 'alternate' as const,
};
export const GET = ApiReference(config);
