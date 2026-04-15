import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FIXLOOP_SCHEMA_SQL,
  createSupabaseStorageAdapter,
} from '../src/index.js';

test('createSupabaseStorageAdapter inserts reports into the configured schema table', async () => {
  const capture = {};
  const client = {
    schema(schemaName) {
      capture.schema = schemaName;
      return {
        from(tableName) {
          capture.table = tableName;
          return {
            insert(payload) {
              capture.insertPayload = payload;
              return {
                select() {
                  return {
                    async single() {
                      return {
                        data: { id: 'issue_1', ...payload[0] },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  const adapter = createSupabaseStorageAdapter({ client, schema: 'fixloop', table: 'issues' });
  const saved = await adapter.createReport({
    projectId: 'storefront',
    type: 'bug',
    title: 'Checkout button does nothing',
    actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
    description: 'Clicking pay leaves the page stuck.',
    actualBehavior: 'Spinner stays visible forever.',
    expectedBehavior: 'Payment should complete.',
    route: '/checkout',
    status: 'new',
    createdAt: '2026-04-15T20:00:00.000Z',
  });

  assert.equal(capture.schema, 'fixloop');
  assert.equal(capture.table, 'issues');
  assert.deepEqual(capture.insertPayload, [
    {
      project_id: 'storefront',
      type: 'bug',
      title: 'Checkout button does nothing',
      actions_before_issue: 'Added products to cart and clicked Pay now.',
      description: 'Clicking pay leaves the page stuck.',
      actual_behavior: 'Spinner stays visible forever.',
      expected_behavior: 'Payment should complete.',
      route: '/checkout',
      status: 'new',
      created_at: '2026-04-15T20:00:00.000Z',
    },
  ]);
  assert.deepEqual(saved, {
    id: 'issue_1',
    projectId: 'storefront',
    type: 'bug',
    title: 'Checkout button does nothing',
    actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
    description: 'Clicking pay leaves the page stuck.',
    actualBehavior: 'Spinner stays visible forever.',
    expectedBehavior: 'Payment should complete.',
    route: '/checkout',
    status: 'new',
    createdAt: '2026-04-15T20:00:00.000Z',
  });
});

test('createSupabaseStorageAdapter lists issues with project filters', async () => {
  const capture = { filters: [] };
  const rows = [
    {
      id: 'issue_1',
      project_id: 'storefront',
      type: 'bug',
      title: 'Checkout button does nothing',
      actions_before_issue: 'Added products to cart and clicked Pay now.',
      description: 'Clicking pay leaves the page stuck.',
      actual_behavior: 'Spinner stays visible forever.',
      expected_behavior: 'Payment should complete.',
      route: '/checkout',
      status: 'ready_for_agent',
      created_at: '2026-04-15T20:00:00.000Z',
    },
  ];

  const client = {
    schema(schemaName) {
      capture.schema = schemaName;
      return {
        from(tableName) {
          capture.table = tableName;
          const builder = {
            select(selection) {
              capture.selection = selection;
              return builder;
            },
            eq(field, value) {
              capture.filters.push([field, value]);
              return builder;
            },
            order(field, options) {
              capture.order = [field, options];
              return builder;
            },
            async limit(value) {
              capture.limit = value;
              return { data: rows, error: null };
            },
          };
          return builder;
        },
      };
    },
  };

  const adapter = createSupabaseStorageAdapter({ client, schema: 'fixloop', table: 'issues' });
  const issues = await adapter.listIssues({
    projectId: 'storefront',
    status: 'ready_for_agent',
    type: 'bug',
    route: '/checkout',
    limit: 5,
  });

  assert.equal(capture.schema, 'fixloop');
  assert.equal(capture.table, 'issues');
  assert.deepEqual(capture.filters, [
    ['project_id', 'storefront'],
    ['status', 'ready_for_agent'],
    ['type', 'bug'],
    ['route', '/checkout'],
  ]);
  assert.deepEqual(capture.order, ['created_at', { ascending: false }]);
  assert.equal(capture.limit, 5);
  assert.deepEqual(issues, [
    {
      id: 'issue_1',
      projectId: 'storefront',
      type: 'bug',
      title: 'Checkout button does nothing',
      actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
      description: 'Clicking pay leaves the page stuck.',
      actualBehavior: 'Spinner stays visible forever.',
      expectedBehavior: 'Payment should complete.',
      route: '/checkout',
      status: 'ready_for_agent',
      createdAt: '2026-04-15T20:00:00.000Z',
    },
  ]);
});

test('FIXLOOP_SCHEMA_SQL contains starter schema objects', () => {
  assert.match(FIXLOOP_SCHEMA_SQL, /create schema if not exists fixloop/i);
  assert.match(FIXLOOP_SCHEMA_SQL, /create table if not exists fixloop\.issues/i);
  assert.match(FIXLOOP_SCHEMA_SQL, /project_id/i);
  assert.match(FIXLOOP_SCHEMA_SQL, /actions_before_issue/i);
  assert.match(FIXLOOP_SCHEMA_SQL, /route text not null/i);
});
