import test from 'node:test';
import assert from 'node:assert/strict';

import { createFixLoopServer } from '../src/index.js';

test('server stores a validated report from POST /reports', async () => {
  const createdReports = [];
  const server = createFixLoopServer({
    storage: {
      async createReport(report) {
        const saved = { id: 'issue_1', ...report };
        createdReports.push(saved);
        return saved;
      },
      async listIssues() {
        return [];
      },
    },
    now: () => '2026-04-15T20:00:00.000Z',
  });

  const response = await server.handle(
    new Request('https://fixloop.dev/reports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId: 'storefront',
        type: 'bug',
        title: 'Checkout button does nothing',
        actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
        description: 'Clicking pay leaves the page stuck.',
        actualBehavior: 'Spinner stays visible forever.',
        expectedBehavior: 'Payment should complete.',
        route: '/checkout',
      }),
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(createdReports.length, 1);

  const body = await response.json();
  assert.equal(body.report.id, 'issue_1');
  assert.equal(body.report.status, 'new');
  assert.equal(body.report.createdAt, '2026-04-15T20:00:00.000Z');
  assert.equal(body.report.actionsBeforeIssue, 'Added products to cart and clicked Pay now.');
  assert.equal(body.report.route, '/checkout');
});

test('server returns filtered issues from GET /issues', async () => {
  const queries = [];
  const server = createFixLoopServer({
    storage: {
      async createReport(report) {
        return { id: 'ignored', ...report };
      },
      async listIssues(query) {
        queries.push(query);
        return [
          {
            id: 'issue_1',
            projectId: 'storefront',
            type: 'bug',
            title: 'Checkout button does nothing',
            actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
            description: 'Clicking pay leaves the page stuck.',
            expectedBehavior: 'Payment should complete.',
            actualBehavior: 'Spinner stays visible forever.',
            route: '/checkout',
            location: 'checkout.footer',
            severity: 'high',
            environment: 'production',
            metadata: { browser: 'Chrome', currentUrl: 'https://app.example.com/checkout' },
            status: 'ready_for_agent',
            createdAt: '2026-04-15T20:00:00.000Z',
            internalNotes: 'do not leak',
          },
        ];
      },
    },
  });

  const response = await server.handle(
    new Request('https://fixloop.dev/issues?projectId=storefront&status=ready_for_agent&limit=5'),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries[0], {
    projectId: 'storefront',
    status: 'ready_for_agent',
    type: undefined,
    route: undefined,
    limit: 5,
  });

  const body = await response.json();
  assert.equal(body.issues.length, 1);
  assert.equal(body.issues[0].internalNotes, undefined);
  assert.equal(body.issues[0].status, 'ready_for_agent');
  assert.equal(body.issues[0].actionsBeforeIssue, 'Added products to cart and clicked Pay now.');
});

test('server returns 400 when POST /reports payload is invalid', async () => {
  const server = createFixLoopServer({
    storage: {
      async createReport(report) {
        return { id: 'issue_1', ...report };
      },
      async listIssues() {
        return [];
      },
    },
  });

  const response = await server.handle(
    new Request('https://fixloop.dev/reports', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId: '',
        type: 'bug',
        title: 'Broken',
        actionsBeforeIssue: 'Clicked save.',
        description: 'Broken',
        actualBehavior: 'Nothing happened.',
        expectedBehavior: 'Profile should save.',
        route: '/settings',
      }),
    }),
  );

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /projectId/i);
});
