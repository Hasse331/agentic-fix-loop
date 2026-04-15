import {
  ValidationError,
  assertStorageAdapter,
  createAgentIssueView,
  normalizeIssueQuery,
  validateProblemReport,
} from '../../core/src/index.js';

function json(data, { status = 200 } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function notFound() {
  return json({ error: 'Not found.' }, { status: 404 });
}

export function createFixLoopServer({ storage, now, authorizeRead } = {}) {
  const adapter = assertStorageAdapter(storage);

  return {
    async handle(request) {
      try {
        const url = new URL(request.url);

        if (request.method === 'POST' && url.pathname === '/reports') {
          const payload = await request.json();
          const report = validateProblemReport(payload, { now });
          const saved = await adapter.createReport(report);
          return json({ report: createAgentIssueView(saved) }, { status: 201 });
        }

        if (request.method === 'GET' && url.pathname === '/issues') {
          const query = normalizeIssueQuery(Object.fromEntries(url.searchParams.entries()));
          if (authorizeRead) {
            await authorizeRead({ request, query });
          }

          const issues = await adapter.listIssues(query);
          return json({ issues: issues.map(createAgentIssueView) });
        }

        return notFound();
      } catch (error) {
        if (error instanceof ValidationError) {
          return json({ error: error.message }, { status: 400 });
        }

        return json({ error: 'Internal server error.' }, { status: 500 });
      }
    },
  };
}
