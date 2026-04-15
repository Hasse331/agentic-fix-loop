const ISSUE_TYPES = ['bug', 'ux_issue'];
const ISSUE_STATUSES = ['new', 'triaged', 'ready_for_agent', 'resolved', 'rejected'];

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new ValidationError(`${fieldName} is required.`);
  }

  return normalized;
}

function normalizeOptionalString(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string when provided.`);
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function normalizeEnum(value, allowedValues, fieldName, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required.`);
    }

    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string.`);
  }

  const normalized = value.trim();
  if (!allowedValues.includes(normalized)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}.`);
  }

  return normalized;
}

function normalizeMetadata(value) {
  if (value === undefined) {
    return {};
  }

  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new ValidationError('metadata must be an object when provided.');
  }

  return { ...value };
}

function normalizeLimit(value) {
  if (value === undefined || value === null || value === '') {
    return 20;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
    throw new ValidationError('limit must be an integer between 1 and 100.');
  }

  return parsed;
}

export function validateProblemReport(input, { now = () => new Date().toISOString() } = {}) {
  const metadata = normalizeMetadata(input.metadata);

  return {
    projectId: normalizeRequiredString(input.projectId, 'projectId'),
    type: normalizeEnum(input.type, ISSUE_TYPES, 'type', { required: true }),
    title: normalizeRequiredString(input.title, 'title'),
    actionsBeforeIssue: normalizeRequiredString(input.actionsBeforeIssue, 'actionsBeforeIssue'),
    description: normalizeRequiredString(input.description, 'description'),
    expectedBehavior: normalizeRequiredString(input.expectedBehavior, 'expectedBehavior'),
    actualBehavior: normalizeRequiredString(input.actualBehavior, 'actualBehavior'),
    route: normalizeRequiredString(input.route, 'route'),
    location: normalizeOptionalString(input.location, 'location'),
    severity: normalizeOptionalString(input.severity, 'severity'),
    environment: normalizeOptionalString(input.environment, 'environment'),
    metadata,
    status: 'new',
    createdAt: now(),
  };
}

export function normalizeIssueQuery(input) {
  return {
    projectId: normalizeRequiredString(input.projectId, 'projectId'),
    status: normalizeEnum(input.status, ISSUE_STATUSES, 'status'),
    type: normalizeEnum(input.type, ISSUE_TYPES, 'type'),
    route: normalizeOptionalString(input.route, 'route'),
    limit: normalizeLimit(input.limit),
  };
}

export function createAgentIssueView(issue) {
  return {
    id: issue.id,
    projectId: issue.projectId,
    type: issue.type,
    title: issue.title,
    actionsBeforeIssue: issue.actionsBeforeIssue,
    description: issue.description,
    expectedBehavior: issue.expectedBehavior,
    actualBehavior: issue.actualBehavior,
    route: issue.route,
    location: issue.location,
    severity: issue.severity,
    environment: issue.environment,
    metadata: issue.metadata ?? {},
    status: issue.status,
    createdAt: issue.createdAt,
  };
}

export function assertStorageAdapter(adapter) {
  if (!adapter || typeof adapter.createReport !== 'function' || typeof adapter.listIssues !== 'function') {
    throw new ValidationError('storage adapter must expose createReport(report) and listIssues(query).');
  }

  return adapter;
}

export { ISSUE_STATUSES, ISSUE_TYPES };
