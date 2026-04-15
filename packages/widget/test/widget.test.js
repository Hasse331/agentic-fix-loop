import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createBrowserReportPayload,
  createFixLoopModal,
  renderFixLoopWidget,
  submitIssueReport,
} from '../src/index.js';

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.hidden = false;
    this.value = '';
    this.name = '';
    this.type = '';
    this.readOnly = false;
    this.textContent = '';
    this.attributes = {};
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parentNode) {
      return;
    }

    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  addEventListener(type, handler) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(handler);
  }

  async dispatchEvent(event) {
    const listeners = this.listeners[event.type] ?? [];
    const enrichedEvent = {
      target: this,
      currentTarget: this,
      defaultPrevented: false,
      ...event,
      preventDefault() {
        enrichedEvent.defaultPrevented = true;
      },
    };

    for (const listener of listeners) {
      await listener(enrichedEvent);
    }

    return !enrichedEvent.defaultPrevented;
  }

  async click() {
    return this.dispatchEvent({ type: 'click' });
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement('body', this);
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

test('renderFixLoopWidget returns embeddable markup with agent-ready bug fields', () => {
  const markup = renderFixLoopWidget({
    projectId: 'storefront',
    heading: 'Report a problem',
    submitLabel: 'Send report',
    route: '/checkout',
  });

  assert.match(markup, /data-fixloop-widget/);
  assert.match(markup, /Report a problem/);
  assert.match(markup, /name="type"/);
  assert.match(markup, /value="bug"/);
  assert.match(markup, /value="ux_issue"/);
  assert.match(markup, /name="route"/);
  assert.match(markup, /value="\/checkout"/);
  assert.match(markup, /readonly/);
  assert.match(markup, /name="actionsBeforeIssue"/);
  assert.match(markup, /name="actualBehavior"/);
  assert.match(markup, /name="expectedBehavior"/);
  assert.match(markup, /Send report/);
  assert.match(markup, /value="storefront"/);
});

test('createBrowserReportPayload combines form data and browser context for agent repair', () => {
  const payload = createBrowserReportPayload({
    projectId: 'storefront',
    values: {
      type: 'bug',
      title: ' Checkout button does nothing ',
      actionsBeforeIssue: ' Added products to cart and clicked Pay now. ',
      description: ' Clicking pay leaves the page stuck. ',
      expectedBehavior: ' Payment should complete. ',
      actualBehavior: ' Spinner stays visible forever. ',
      location: ' checkout.footer ',
      severity: ' high ',
      route: ' /checkout ',
    },
    browserContext: {
      environment: 'production',
      metadata: {
        browser: 'Chrome',
        viewport: '1440x900',
        currentUrl: 'https://app.example.com/checkout',
      },
    },
  });

  assert.deepEqual(payload, {
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
      viewport: '1440x900',
      currentUrl: 'https://app.example.com/checkout',
    },
  });
});

test('createFixLoopModal mounts UI, opens, closes, and syncs route', async () => {
  const documentRef = new FakeDocument();
  const modal = createFixLoopModal({
    projectId: 'storefront',
    endpoint: '/api/fixloop/reports',
    documentRef,
    fetchImpl: async () => new Response(JSON.stringify({ report: { id: 'issue_1' } }), { status: 201, headers: { 'content-type': 'application/json' } }),
    getRoute: () => '/checkout',
    getCurrentUrl: () => 'https://app.example.com/checkout',
  });

  modal.mount();

  assert.equal(documentRef.body.children.length, 1);
  assert.equal(modal.elements.modal.hidden, true);

  await modal.elements.trigger.click();
  assert.equal(modal.elements.modal.hidden, false);
  assert.equal(modal.elements.fields.route.value, '/checkout');

  await modal.elements.closeButton.click();
  assert.equal(modal.elements.modal.hidden, true);
});

test('createFixLoopModal submits an agent-ready report payload', async () => {
  const documentRef = new FakeDocument();
  const calls = [];
  const modal = createFixLoopModal({
    projectId: 'storefront',
    endpoint: '/api/fixloop/reports',
    documentRef,
    environment: 'production',
    getRoute: () => '/checkout',
    getCurrentUrl: () => 'https://app.example.com/checkout',
    getMetadata: () => ({ browser: 'Chrome' }),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ report: { id: 'issue_1', status: 'new' } }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  modal.mount();
  await modal.open();

  modal.elements.fields.type.value = 'bug';
  modal.elements.fields.title.value = 'Checkout button does nothing';
  modal.elements.fields.actionsBeforeIssue.value = 'Added products to cart and clicked Pay now.';
  modal.elements.fields.actualBehavior.value = 'Spinner stays visible forever.';
  modal.elements.fields.expectedBehavior.value = 'Payment should complete.';
  modal.elements.fields.description.value = 'Clicking pay leaves the page stuck.';
  modal.elements.fields.location.value = 'checkout.footer';
  modal.elements.fields.severity.value = 'high';

  await modal.elements.form.dispatchEvent({ type: 'submit' });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/fixloop/reports');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
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
      currentUrl: 'https://app.example.com/checkout',
    },
  });
  assert.equal(modal.elements.modal.hidden, true);
  assert.equal(modal.elements.status.textContent, 'Report sent.');
});

test('submitIssueReport posts report JSON to the configured endpoint', async () => {
  const calls = [];
  const response = await submitIssueReport({
    endpoint: 'https://fixloop.dev/reports',
    report: {
      projectId: 'storefront',
      type: 'bug',
      title: 'Checkout button does nothing',
      actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
      description: 'Clicking pay leaves the page stuck.',
      actualBehavior: 'Spinner stays visible forever.',
      expectedBehavior: 'Payment should complete.',
      route: '/checkout',
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(
        JSON.stringify({ report: { id: 'issue_1', status: 'new' } }),
        {
          status: 201,
          headers: { 'content-type': 'application/json' },
        },
      );
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://fixloop.dev/reports');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    projectId: 'storefront',
    type: 'bug',
    title: 'Checkout button does nothing',
    actionsBeforeIssue: 'Added products to cart and clicked Pay now.',
    description: 'Clicking pay leaves the page stuck.',
    actualBehavior: 'Spinner stays visible forever.',
    expectedBehavior: 'Payment should complete.',
    route: '/checkout',
  });
  assert.deepEqual(response, { report: { id: 'issue_1', status: 'new' } });
});
