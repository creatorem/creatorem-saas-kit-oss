---
name: mobile-ui
description: Enforce Planoby-inspired mobile UI standards across this monorepo with an iOS-first strategy, selective Expo native API adoption, and mandatory Android or unsupported-iOS fallbacks.
---

# Mobile UI Standards

## Overview
Apply a strict iOS-first UX strategy while preserving reliable cross-platform behavior. Prefer Expo native capabilities only when they provide a clear and material user-experience improvement versus React Native primitives and maintenance cost.

This monorepo uses this file as the only authoritative Mobile UI skill definition. Any copy outside this repository (for example under `~/.codex/skills`) is non-authoritative for this project.

Read `references/planoby-mobile-examples.md` when you need:
- Exact official Expo API docs linked by feature.
- Concrete in-repo examples to mirror before introducing new patterns.

## Core Policy
Use this decision rule before introducing any platform-specific feature:

1. Evaluate UX gain: low, medium, or high.
2. Evaluate fallback cost and long-term maintenance cost.
3. Use Expo native API only when UX gain is high and fallback cost is acceptable.
4. Default to React Native components when gain is low or medium.

Reject shiny-native additions that increase maintenance without clear user value.

## Design Direction
- Keep visual language closer to iOS than Android when using custom React Native UI.
- Preserve cross-platform behavior parity (no broken flows on Android).
- Keep interaction quality high: smooth transitions, responsive feedback, clear state changes.

## Navigation and Tabs Standards
### Native tabs policy
- Use `expo-router/unstable-native-tabs` on supported iOS versions.
- Provide fallback tab implementation for Android and unsupported iOS versions.
- Mirror route coverage and tab semantics between native and fallback tabs.
- Include a dedicated Search tab trigger in tab navigation when a search route exists:
  - iOS native tabs: `NativeTabs.Trigger` with `role="search"`.
  - Fallback tabs: matching `TabTrigger` route so feature parity is preserved.

### Tabs + toolbar structure (mandatory)
- For tabs that use `Stack.Toolbar`, each tab route must be folderized:
  - `tab-name/_layout.tsx` (tab-local stack)
  - `tab-name/index.tsx` (screen entry)
- Do not rely on flat tab files when toolbar actions are needed; toolbar actions should be declared inside tab-local stack screens.
- For consistency in this repository, prefer folderized tab routes for all tabs, not only complex ones.

### Route invariance rule
- Folderization/refactors must preserve route slugs and existing deep-link paths.
- If `index` is migrated to a named folder route (for example `home`), keep a stable redirect entry so legacy links still resolve.

Reference implementation:
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/_layout.tsx`

## Expo SwiftUI Component Adoption Policy
### Preferred components (when UX impact is high)
- Toggle
- Picker
- Menu
- DatePicker
- Button
- BottomSheet

### Avoid by default
- Form (`@expo/ui/swift-ui/form`)

Reason:
- Form is often too generic versus hand-crafted layout using React Native View + existing field components.
- Form adoption multiplies platform fallback complexity with limited UX upside.

### SwiftUI preflight (mandatory before shipping)
- Use real `@expo/ui` runtime integration for iOS-native behavior.
- Do not alias `@expo/ui/swift-ui` or `@expo/ui/swift-ui/modifiers` to shims in Metro.
- Do not exclude `@expo/ui` from Expo autolinking.
- Ensure `@expo/ui` is installed and SDK-compatible in each app.
- Rebuild iOS native binaries after enabling/changing SwiftUI wiring (`expo run:ios` / dev client rebuild).

## Form Design Standards
- Build forms with React Native `View` composition and project form primitives.
- Use `@kit/native-ui/form-section` primitives for all Planoby mobile forms: `FormTitle`, `FormBox`, `FormDescription`, `FormRow`, `FormSeparator`, and `FormSection`.
- Prefer `FormSection` for normal sections. It is shorthand for `FormTitle` above `FormBox`, then `FormDescription` after `FormBox`.
- For custom composition, preserve that order exactly: title above the grouped card, description below the grouped card.
- Inside every `FormBox`, wrap each field/control row with `FormRow` and separate rows with `FormSeparator`; never add a separator after the last row.
- Small controls use the iOS settings pattern: label on the left, control on the right. This includes text, number, color, time, picker, toggle, and other compact inputs.
- Large multiline text (`Input isMultiline`) should usually be full-width with a placeholder and no separate row label.
- Complex controls can be full-width when they need room, but still live inside `FormRow`/`FormBox` structure unless the component already renders that structure.
- `Input variant="ios"` already renders a `FormRow`; use it directly in `FormBox` and set `containerClassName="border-b-0"` when it is the last visual row or a standalone multiline field.
- Use a real toggle component for boolean values. Avoid replacing binary settings with True/False/Unset button clusters unless a nullable tri-state is required.
- Use `className` for outer section spacing/layout and `innerClassName` for card-level customization.

Reference implementation:
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/bookings/edit.tsx`

### Form Composition Pattern
Use this pattern for custom form sections. `Input variant="ios"` already renders its own `FormRow`, so place it directly in `FormBox`/`FormSection` and add `FormSeparator` between inputs.

```tsx
<FormTitle>Section title</FormTitle>
<FormBox>
  <Input label="Name" variant="ios" />
  <FormSeparator />
  <FormRow>
    <Text>Enabled</Text>
    <Toggle value={enabled} onValueChange={setEnabled} />
  </FormRow>
</FormBox>
<FormDescription>Helpful context after the grouped card.</FormDescription>
```

For simple sections prefer the shortcut:

```tsx
<FormSection title="Customer note" description="Visible to the customer.">
  <Input
    variant="ios"
    isMultiline
    placeholder="Customer note"
    containerClassName="border-b-0"
  />
</FormSection>
```

## Toolbar Standards
- `Stack.Toolbar` is mandatory for in-app top header actions.
- Use `Stack.Toolbar.Button` and `Stack.Toolbar.Menu` for header actions on all page types, including:
  - list pages
  - single/detail pages
  - edit/create pages
  - settings pages
- Do not use custom in-content top button rows or ad-hoc header button containers when a top action belongs in the header.
- Keep toolbar actions concise and task-oriented (navigation/back, create, edit, notifications, filters, contextual menu actions).
- Standard placement:
  - left: navigation/back or primary contextual identity
  - right: contextual actions and overflow menu
- If a screen has top actions, they must be implemented through `Stack.Toolbar`, not custom header components.
- For any `Stack.Toolbar.Button` that uses `variant="prominent"`, always resolve colors with `useThemeColors` and set `tintColor` explicitly.
- Default active prominent tint must be `colors['--color-primary']` (no hardcoded hex for prominent buttons).

Reference implementation:
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/components/agenda/screens/agenda-screen.tsx` (around line 3206)

## Search Page Standards
- On iOS, search screens must use `Stack.SearchBar` in the header.
- On Android (and unsupported iOS behavior), use an inline fallback search field (`TextInput`) in the page content.
- Keep query state shared between iOS `Stack.SearchBar` and fallback field behavior.
- Always define clear behavior:
  - `onChangeText`: update query state.
  - `onCancelButtonPress`: clear query state on iOS.
- Do not rely on `Stack.SearchBar` as the only path because it is not cross-platform-complete for Android.
- Keep top actions in `Stack.Toolbar`; do not reintroduce ad-hoc in-content top button rows for search screens.

Reference implementation:
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/search/index.tsx`

## Scroll Container Standards
- For every screen-level `ScrollView` (including wrappers such as `ThemedScroller` that render `ScrollView` internally), always set `contentInsetAdjustmentBehavior="automatic"`.
- Treat missing `contentInsetAdjustmentBehavior="automatic"` as a blocking issue on iOS-focused screens.
- Keep the screen scroll container low in the page tree:
  - Prefer at the screen root.
  - Accept one non-scrolling wrapper level above it (second level).
  - Avoid deep nesting of the primary `ScrollView` under multiple layout wrappers.
- If a wrapper must sit above a `FormSection`, that wrapper should not add horizontal inset drift that changes section width alignment.

### FlatList Standards (mandatory)
- For pages whose primary scroll surface is a list, return `FlatList` as the primary/root screen scroll container.
- Do not wrap the main `FlatList` in a parent `ScrollView`/`ThemedScroller`.
- Always set `contentInsetAdjustmentBehavior="automatic"` on screen-level `FlatList`.
- Use `ListHeaderComponent` and `ListFooterComponent` for top/bottom contextual blocks instead of stacking extra scroll containers around the list.
- Keep `FlatList` at root or second-level depth only (for example one non-scrolling background wrapper is acceptable).

Pattern:

```tsx
return (
  <FlatList
    data={items}
    keyExtractor={(item) => item.id}
    contentInsetAdjustmentBehavior="automatic"
    ListHeaderComponent={(
      <>
        {renderToolbar()}
        {renderFilters()}
      </>
    )}
    ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
    renderItem={renderItem}
    contentContainerStyle={{ paddingBottom: 100 }}
  />
);
```

### Form Sheet Save Button Role (Top-Right Checkmark)
For form-sheet create/edit routes, the top-right checkmark button must follow this state behavior:

1. Clean state (`!isDirty`)
- Use `variant="prominent"`.
- Disable the button.
- Use muted tint.

2. Dirty + invalid state (`isDirty` and validation errors exist)
- Keep the button enabled.
- Use destructive tint.
- On press, run validation and reveal field errors (React Hook Form error flow), do not submit.

3. Dirty + valid state (`isDirty` and no validation errors)
- Keep `variant="prominent"`.
- Use primary tint from `useThemeColors` (`tintColor={colors['--color-primary']}`).
- On press, submit.

Implementation notes:
- Keep this as a visual + behavioral state machine, not just styling.
- Prefer deriving state from React Hook Form (`formState.isDirty`, `formState.errors`, `handleSubmit` / `trigger`).
- Even when state-specific tint changes are required (disabled/error), derive tint from theme tokens via `useThemeColors`; never hardcode prominent button colors.

Reference implementation:
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/agenda/create-slot.tsx`

## Transition Standards
- Use Expo Router shared transition patterns (`Link.AppleZoom`) whenever continuity improves comprehension.
- Prioritize continuity transitions for cards, media, and high-intent list-to-detail interactions.
- Reuse the pattern beyond images when an element can remain visually continuous between screens.

Reference implementation:
- From `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/services/index.tsx`
- To `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/services/single.tsx`

## Editable Flow and Modal Standards
- When editing an item from a list/detail context, present editing in a dedicated form sheet style view.
- Prefer Stack `presentation: 'formSheet'` where appropriate to match native interaction patterns.
- Keep create/edit experiences focused and scoped; avoid cluttered full-screen editors unless necessary.

Reference implementations:
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/agenda/create-slot.tsx`
- `/Users/arnaudpfu/nextjs-expo-boilerplate/main_august/creatorem-saas-kit-cm-app/apps/planoby-mobile/app/(app)/(tabs)/agenda/_layout.tsx`

## Styling Standards
- Use NativeWind `className` first.
- Use raw `style` objects only when values are dynamic or not representable cleanly with static classes.
- Resolve dynamic theme colors through `useThemeColors` before injecting into style objects.
- Do not hardcode palette values when theme tokens exist.

## Required Fallback Discipline
For every iOS-enhanced feature introduced, define fallback behavior in the same PR:

1. Unsupported iOS behavior.
2. Android behavior.
3. Functional parity check.
4. Visual quality check.

If fallback quality is poor or incomplete, do not ship the native enhancement.

## Platform-Equivalent Component Structure
When a component uses an iOS system-native capability, always implement an explicit platform-equivalent structure:

1. `component.tsx`: primary cross-platform entry point and fallback implementation.
2. `component.ios.tsx`: iOS-native implementation (SwiftUI / native API bridge) called by the primary entry point.

Rules:
- In `component.tsx`, use `Platform.OS` branching to route to the iOS implementation when needed.
- Keep all app imports on the stable `@kit/native-ui/*` module path.
- Keep prop signatures aligned across iOS and fallback implementations.
- Ship iOS path and fallback path in the same change.

## Implementation Workflow
When asked to design or refactor a mobile UI feature:

1. Classify feature type: navigation, form, list/detail, modal flow, or transition.
2. Decide component family using the adoption policy.
3. Implement iOS-enhanced path if justified.
4. Implement fallback path in the same change.
5. Apply NativeWind-first styling and theme token usage.
6. Add loading, empty, and error states.
7. Ensure the screen `ScrollView`/`ThemedScroller` is root or second-level and uses `contentInsetAdjustmentBehavior="automatic"`.
8. Validate interaction quality on first render and navigation back/forward.

## Review Checklist
Treat the task as incomplete unless all checks pass:

- iOS-first quality bar met.
- Android and unsupported-iOS fallback exists and is usable.
- No unnecessary Expo-native dependency for low-impact UI.
- No use of SwiftUI Form unless explicitly approved.
- Stack toolbar used where action density warrants it.
- Stack toolbar buttons/menus used for top header actions on all in-app screens (including single/detail/edit/settings flows).
- Every `variant="prominent"` toolbar button sets `tintColor` from `useThemeColors` (default active = `--color-primary`).
- Tab routes that rely on toolbar APIs are folderized with tab-local stacks.
- Continuity transition considered for list-to-detail flows.
- Form editing uses form sheet presentation when contextually appropriate.
- NativeWind-first styling preserved.
- Dynamic colors sourced from `useThemeColors`.
- iOS SwiftUI surfaces (menus/toolbars) render with expected liquid/glass appearance when native path is enabled.
- Screen-level `ScrollView`/`ThemedScroller` uses `contentInsetAdjustmentBehavior="automatic"`.
- Primary page scroll container is root-level or second-level in the screen tree.
- Screen-level `FlatList` uses `contentInsetAdjustmentBehavior="automatic"` and header/footer composition via `ListHeaderComponent` / `ListFooterComponent`.

## Anti-Patterns
- Introducing platform-specific APIs without fallback.
- Using Expo SwiftUI Form for simple data entry sections.
- Replacing proven React Native composition with native wrappers that do not improve UX.
- Mixing extensive inline style objects where static classes are sufficient.
- Shipping transition-heavy flows that regress clarity or performance.
- Deeply nesting the screen’s primary `ScrollView` under multiple wrappers.
- Omitting `contentInsetAdjustmentBehavior="automatic"` on screen-level `ScrollView` paths.
