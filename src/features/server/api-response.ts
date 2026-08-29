import { buildServerInspection, type ServerInspection } from './server-inspection';

type Inspector = (request: Request) => ServerInspection;

export const createApiResponse = (
  request: Request,
  inspect: Inspector = buildServerInspection,
): Response => {
  try {
    return new Response(JSON.stringify(inspect(request)), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({
        schemaVersion: 1,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unable to inspect this request.',
        },
      }),
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  }
};
