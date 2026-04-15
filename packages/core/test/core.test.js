import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ValidationError,
  createAgentIssueView,
  normalizeIssueQuery,
  validateProblemReport,
} from '../src/index.js';

test('validateProblemReport trims fields and applies agent-ready defaults', () => {
  const report = validateProblemReport(
    {
      projectId: '  storefront  ',
      type: 'bug',
      title: '  Checkout button does nothing  ',
      actionsBeforeIssue: '  Added products to cart and clicked Pay now.  ',
      description: '  Clicking pay leaves the page stuck.  ',
      expectedBehavior: '  Payment should complete.  ',
      actualBehavior: '  Spinner stays visible forever.  ',
      route: '  /checkout  ',
      severity: ' high ',
      environment: ' production ',
      metadata: {
        browser: 'Chrome',
      },
    },
    { now: () => '2026-04-15T20:00:00.000Z' },
  );

  assert.deepEqual(report, {
    projectId: 'storefront',
    type: 'bug',
    title: 'Checkout button does nothing',
    actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
    description: 'Clicking pay leaves the page stuck.',
    expectedBehavior: 'Payment should complete.',
    actualBehavior: 'Spinner stays visible forever.',
    route: '/checkout',
    location: undefined,
    severity: 'high',
    environment: 'production',
    metadata: {
      browser: 'Chrome',
    },
    status: 'new',
    createdAt: '2026-04-15T20:00:00.000Z',
  });
});

test('validateProblemReport rejects issue types outside bug and ux_issue', () => {
  assert.throws(
    () =>
      validateProblemReport({
        projectId: 'storefront',
        type: 'content_issue',
        title: 'Broken',
        actionsBeforeIssue: 'Clicked save.',
        description: 'Broken',
        actualBehavior: 'Nothing happened.',
        expectedBehavior: 'Profile should save.',
        route: '/settings',
      }),
    ValidationError,
  );
});

test('validateProblemReport requires route and reproduction context', () => {
  assert.throws(
    () =>
      validateProblemReport({
        projectId: 'storefront',
        type: 'bug',
        title: 'Broken',
        description: 'Broken',
        actualBehavior: 'Nothing happened.',
        expectedBehavior: 'Profile should save.',
      }),
    ValidationError,
  );
});

test('normalizeIssueQuery validates required project and optional filters', () => {
  const query = normalizeIssueQuery({
    projectId: ' storefront ',
    status: ' ready_for_agent ',
    type: ' bug ',
    route: ' /checkout ',
    limit: '10',
  });

  assert.deepEqual(query, {
    projectId: 'storefront',
    status: 'ready_for_agent',
    type: 'bug',
    route: '/checkout',
    limit: 10,
  });
});

test('createAgentIssueView returns safe issue fields for an agent', () => {
  const view = createAgentIssueView({
    id: 'issue_123',
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
    metadata: {
      browser: 'Chrome',
      deploymentId: 'deploy_123',
      currentUrl: 'https://app.example.com/checkout',
    },
    status: 'ready_for_agent',
    createdAt: '2026-04-15T20:00:00.000Z',
    internalNotes: 'do not leak',
  });

  assert.deepEqual(view, {
    id: 'issue_123',
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
    metadata: {
      browser: 'Chrome',
      deploymentId: 'deploy_123',
      currentUrl: 'https://app.example.com/checkout',
    },
    status: 'ready_for_agent',
    createdAt: '2026-04-15T20:00:00.000Z',
  });
});
