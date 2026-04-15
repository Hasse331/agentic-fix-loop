const testFiles = [
  '../packages/core/test/core.test.js',
  '../packages/server/test/server.test.js',
  '../packages/widget/test/widget.test.js',
  '../packages/storage-supabase/test/storage-supabase.test.js',
];

for (const file of testFiles) {
  await import(new URL(file, import.meta.url));
}
