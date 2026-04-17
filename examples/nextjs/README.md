# Next.js Example

This example shows the shortest supported integration path for the widget package:

```tsx
<AgenticFixLoop projectName="ExampleApp" />
```

For storefront-like layouts, the package also supports:

```tsx
<AgenticFixLoopProvider projectName="ExampleApp">
  <ReportProblemButton mode="embedded" appearance="text">
    Report a problem
  </ReportProblemButton>
  <ReportProblemModal />
</AgenticFixLoopProvider>
```
