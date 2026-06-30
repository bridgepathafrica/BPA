# @workspace/api-spec — OpenAPI Specification

Single source of truth for all Bridgepath Africa API request and response shapes.

## File

`openapi.yaml` — OpenAPI 3.1 specification covering all `/api/*` routes.

## Generating client code

After editing `openapi.yaml`, regenerate the TypeScript client hooks and Zod validators:

```bash
pnpm --filter @workspace/api-client-react run generate
pnpm --filter @workspace/api-zod run generate
```

> Do not hand-edit the files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/` — they will be overwritten on the next generate run.

## Conventions

- All endpoints are grouped by resource prefix (`/api/auth`, `/api/jobs`, `/api/applications`, etc.)
- Every endpoint has an `operationId` that Orval uses as the generated hook name
- Request bodies and responses reference named schemas in `components/schemas`
- Authentication is indicated with `security: [{ bearerAuth: [] }]`
