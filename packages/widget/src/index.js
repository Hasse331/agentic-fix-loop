function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return String(value).trim() || undefined;
}

function appendChildren(parent, children) {
  for (const child of children) {
    parent.appendChild(child);
  }

  return parent;
}

function createField(documentRef, tagName, { name, type, value = '', readOnly = false, textContent } = {}) {
  const field = documentRef.createElement(tagName);

  if (name) {
    field.name = name;
    field.setAttribute?.('name', name);
  }

  if (type) {
    field.type = type;
    field.setAttribute?.('type', type);
  }

  if (value !== undefined) {
    field.value = value;
    field.setAttribute?.('value', value);
  }

  if (readOnly) {
    field.readOnly = true;
    field.setAttribute?.('readonly', 'readonly');
  }

  if (textContent) {
    field.textContent = textContent;
  }

  return field;
}

function createLabeledField(documentRef, labelText, field) {
  const label = documentRef.createElement('label');
  label.textContent = labelText;
  label.appendChild(field);
  return label;
}

export function renderFixLoopWidget({
  projectId,
  heading = 'Report a problem',
  submitLabel = 'Send report',
  route = '',
} = {}) {
  const safeProjectId = escapeHtml(projectId ?? '');
  const safeHeading = escapeHtml(heading);
  const safeSubmitLabel = escapeHtml(submitLabel);
  const safeRoute = escapeHtml(route);

  return `
<section data-fixloop-widget>
  <button type="button" data-fixloop-trigger>${safeHeading}</button>
  <form data-fixloop-form>
    <input type="hidden" name="projectId" value="${safeProjectId}" />
    <label>Issue type
      <select name="type">
        <option value="bug">Bug</option>
        <option value="ux_issue">UX issue</option>
      </select>
    </label>
    <label>Summary
      <input name="title" />
    </label>
    <label>Route
      <input name="route" value="${safeRoute}" readonly />
    </label>
    <label>What were you doing before the problem?
      <textarea name="actionsBeforeIssue"></textarea>
    </label>
    <label>What happened?
      <textarea name="actualBehavior"></textarea>
    </label>
    <label>How should it work?
      <textarea name="expectedBehavior"></textarea>
    </label>
    <label>Extra details
      <textarea name="description"></textarea>
    </label>
    <label>Location in the UI
      <input name="location" />
    </label>
    <label>Severity
      <input name="severity" />
    </label>
    <button type="submit">${safeSubmitLabel}</button>
  </form>
</section>`.trim();
}

export function createBrowserReportPayload({ projectId, values = {}, browserContext = {} } = {}) {
  const route = normalizeOptionalString(values.route) ?? normalizeOptionalString(browserContext.route);
  const metadata = browserContext.metadata ? { ...browserContext.metadata } : {};

  if (browserContext.currentUrl && !metadata.currentUrl) {
    metadata.currentUrl = browserContext.currentUrl;
  }

  return {
    projectId: normalizeOptionalString(projectId),
    type: normalizeOptionalString(values.type),
    title: normalizeOptionalString(values.title),
    actionsBeforeIssue: normalizeOptionalString(values.actionsBeforeIssue),
    description: normalizeOptionalString(values.description),
    expectedBehavior: normalizeOptionalString(values.expectedBehavior),
    actualBehavior: normalizeOptionalString(values.actualBehavior),
    route,
    location: normalizeOptionalString(values.location),
    severity: normalizeOptionalString(values.severity),
    environment: normalizeOptionalString(browserContext.environment),
    metadata,
  };
}

export async function submitIssueReport({ endpoint, report, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(report),
  });

  return response.json();
}

export function createFixLoopModal({
  projectId,
  endpoint,
  heading = 'Report a problem',
  submitLabel = 'Send report',
  triggerLabel = 'Report a problem',
  documentRef = globalThis.document,
  fetchImpl = globalThis.fetch,
  environment,
  getRoute = () => globalThis.location?.pathname ?? '',
  getCurrentUrl = () => globalThis.location?.href ?? undefined,
  getMetadata = () => ({}),
  onSuccess,
  onError,
} = {}) {
  let mounted = false;
  let root;
  let trigger;
  let modal;
  let closeButton;
  let form;
  let status;
  let fields;

  function syncRoute() {
    fields.route.value = getRoute() ?? '';
    return fields.route.value;
  }

  function collectValues() {
    return {
      type: fields.type.value,
      title: fields.title.value,
      actionsBeforeIssue: fields.actionsBeforeIssue.value,
      actualBehavior: fields.actualBehavior.value,
      expectedBehavior: fields.expectedBehavior.value,
      description: fields.description.value,
      route: fields.route.value,
      location: fields.location.value,
      severity: fields.severity.value,
    };
  }

  function close() {
    modal.hidden = true;
    return api;
  }

  async function open() {
    syncRoute();
    modal.hidden = false;
    return api;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    status.textContent = '';
    syncRoute();

    try {
      const report = createBrowserReportPayload({
        projectId,
        values: collectValues(),
        browserContext: {
          route: fields.route.value,
          environment,
          currentUrl: getCurrentUrl(),
          metadata: getMetadata(),
        },
      });

      const result = await submitIssueReport({ endpoint, report, fetchImpl });
      status.textContent = 'Report sent.';
      close();

      if (onSuccess) {
        await onSuccess(result);
      }
    } catch (error) {
      status.textContent = 'Failed to send report.';
      if (onError) {
        await onError(error);
      }
    }
  }

  function mount(container = documentRef.body) {
    if (mounted) {
      return api;
    }

    root = documentRef.createElement('section');
    root.setAttribute?.('data-fixloop-widget', '');

    trigger = createField(documentRef, 'button', { type: 'button' });
    trigger.textContent = triggerLabel;
    trigger.setAttribute?.('data-fixloop-trigger', '');
    trigger.addEventListener('click', open);

    modal = documentRef.createElement('div');
    modal.setAttribute?.('data-fixloop-modal', '');
    modal.hidden = true;

    const panel = documentRef.createElement('div');
    panel.setAttribute?.('role', 'dialog');
    panel.setAttribute?.('aria-modal', 'true');

    const title = documentRef.createElement('h2');
    title.textContent = heading;

    closeButton = createField(documentRef, 'button', { type: 'button' });
    closeButton.textContent = 'Close';
    closeButton.setAttribute?.('data-fixloop-close', '');
    closeButton.addEventListener('click', close);

    form = documentRef.createElement('form');
    form.setAttribute?.('data-fixloop-form', '');
    form.addEventListener('submit', handleSubmit);

    fields = {
      type: documentRef.createElement('select'),
      title: createField(documentRef, 'input', { name: 'title' }),
      route: createField(documentRef, 'input', { name: 'route', readOnly: true }),
      actionsBeforeIssue: documentRef.createElement('textarea'),
      actualBehavior: documentRef.createElement('textarea'),
      expectedBehavior: documentRef.createElement('textarea'),
      description: documentRef.createElement('textarea'),
      location: createField(documentRef, 'input', { name: 'location' }),
      severity: createField(documentRef, 'input', { name: 'severity' }),
    };

    fields.type.name = 'type';
    fields.type.setAttribute?.('name', 'type');
    const bugOption = createField(documentRef, 'option', { value: 'bug', textContent: 'Bug' });
    const uxOption = createField(documentRef, 'option', { value: 'ux_issue', textContent: 'UX issue' });
    fields.type.appendChild(bugOption);
    fields.type.appendChild(uxOption);
    fields.type.value = 'bug';

    fields.actionsBeforeIssue.name = 'actionsBeforeIssue';
    fields.actualBehavior.name = 'actualBehavior';
    fields.expectedBehavior.name = 'expectedBehavior';
    fields.description.name = 'description';

    const submitButton = createField(documentRef, 'button', { type: 'submit' });
    submitButton.textContent = submitLabel;

    status = documentRef.createElement('p');
    status.setAttribute?.('data-fixloop-status', '');
    status.textContent = '';

    appendChildren(form, [
      createLabeledField(documentRef, 'Issue type', fields.type),
      createLabeledField(documentRef, 'Summary', fields.title),
      createLabeledField(documentRef, 'Route', fields.route),
      createLabeledField(documentRef, 'What were you doing before the problem?', fields.actionsBeforeIssue),
      createLabeledField(documentRef, 'What happened?', fields.actualBehavior),
      createLabeledField(documentRef, 'How should it work?', fields.expectedBehavior),
      createLabeledField(documentRef, 'Extra details', fields.description),
      createLabeledField(documentRef, 'Location in the UI', fields.location),
      createLabeledField(documentRef, 'Severity', fields.severity),
      submitButton,
      status,
    ]);

    appendChildren(panel, [title, closeButton, form]);
    modal.appendChild(panel);
    appendChildren(root, [trigger, modal]);
    container.appendChild(root);

    mounted = true;
    syncRoute();

    return api;
  }

  function destroy() {
    if (!mounted) {
      return api;
    }

    root.remove();
    mounted = false;
    return api;
  }

  const api = {
    mount,
    open,
    close,
    destroy,
    get elements() {
      return {
        root,
        trigger,
        modal,
        closeButton,
        form,
        status,
        fields,
      };
    },
  };

  return api;
}
