import { defineConfig } from 'orval'

export default defineConfig({
  medisupplyApi: {
    input: {
      target: 'https://bffproyecto.juanandresdeveloper.com/bff/openapi.json'
    },
    output: {
      mode: 'tags-split',
      target: './src/generated/api',
      schemas: './src/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/lib/axios-instance.ts',
          name: 'customInstance'
        },
        query: {
          useQuery: true,
          useMutation: true,
          useInfinite: true,
          useSuspenseQuery: true
        }
      }
    }
  }
})
