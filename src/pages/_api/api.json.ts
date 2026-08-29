import { createApiResponse } from '../../features/server/api-response';

export const GET = (request: Request) => createApiResponse(request);

export const HEAD = (request: Request) => {
  const response = createApiResponse(request);
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};
