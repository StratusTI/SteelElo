import { ApiReference } from '@scalar/nextjs-api-reference'
import type { HtmlRenderingConfiguration } from '@scalar/nextjs-api-reference'

const config: Partial<HtmlRenderingConfiguration> = {
  url: 'http://localhost:3000/openapi.json',
  theme: 'alternate',
}
export const GET = ApiReference(config)
