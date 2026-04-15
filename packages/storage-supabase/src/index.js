const FIELD_MAP = {
  projectId: 'project_id',
  actionsBeforeIssue: 'actions_before_issue',
  expectedBehavior: 'expected_behavior',
  actualBehavior: 'actual_behavior',
  createdAt: 'created_at',
};

function toDatabaseRecord(record) {
  const normalized = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }

    normalized[FIELD_MAP[key] ?? key] = value;
  }

  return normalized;
}

function toDomainRecord(record) {
  const normalized = {};

  for (const [key, value] of Object.entries(record)) {
    const domainKey = Object.keys(FIELD_MAP).find((candidate) => FIELD_MAP[candidate] === key) ?? key;
    normalized[domainKey] = value;
  }

  return normalized;
}

function ensureResult(result, action) {
  if (result.error) {
    throw new Error(`Supabase ${action} failed: ${result.error.message ?? result.error}`);
  }

  return result.data;
}

export const FIXLOOP_SCHEMA_SQL = `
create schema if not exists fixloop;

create table if not exists fixloop.issues (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  type text not null,
  title text not null,
  actions_before_issue text not null,
  description text not null,
  expected_behavior text not null,
  actual_behavior text not null,
  route text not null,
  location text,
  severity text,
  environment text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists fixloop_issues_project_id_idx
  on fixloop.issues (project_id, created_at desc);
`;

export function createSupabaseStorageAdapter({ client, schema = 'fixloop', table = 'issues' } = {}) {
  const scopedTable = client.schema(schema).from(table);

  return {
    async createReport(report) {
      const result = await scopedTable.insert([toDatabaseRecord(report)]).select().single();
      return toDomainRecord(ensureResult(result, 'insert'));
    },

    async listIssues(query) {
      let builder = scopedTable.select('*').eq('project_id', query.projectId);

      if (query.status) {
        builder = builder.eq('status', query.status);
      }

      if (query.type) {
        builder = builder.eq('type', query.type);
      }

      if (query.route) {
        builder = builder.eq('route', query.route);
      }

      const result = await builder.order('created_at', { ascending: false }).limit(query.limit);
      return ensureResult(result, 'select').map(toDomainRecord);
    },
  };
}
