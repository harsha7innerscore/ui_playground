# Chakra UI v3 Updated Project

This project contains UI components updated to work with Chakra UI v3. The goal is to ensure all components are compatible with the latest version while maintaining their original functionality.

## Technology Stack

- **React**: v18.2.0
- **TypeScript**: v4.9.5
- **Chakra UI**: v3.27.0
- **Storybook**: v7.6.15
- **Node.js**: 18.x (compatible with 18.20.4)

## Chakra UI v3 Migration Guidelines

### Key Breaking Changes

1. **Style Props**:
   - `sx` prop is replaced with `css` prop for inline styling
   - Nested styles require `&` prefix, e.g., `css={{ "&:hover": { color: "red" } }}`
   - `__css` prop should only be used in component development, not in application code

2. **Component Props**:
   - `isActive` → `data-active` attribute
   - `isDisabled` → `disabled` attribute
   - `colorScheme` → `colorPalette`
   - `isRounded` → `borderRadius="full"`
   - `invalid` → wrap component in `Field.Root invalid`

3. **Variants**:
   - Button variants are now: "outline", "solid", "subtle", "surface", "ghost", "plain"
   - "unstyled" variant has been removed, use "plain" instead

4. **Disabled State**:
   - `&:disabled` CSS selector is replaced with `&[data-disabled]`

5. **Component Structure**:
   - Many components now use explicit composition patterns
   - Portal handling has changed for popover components

### Workflow for Component Updates

1. First check if the component uses any of the deprecated props or patterns
2. Update any uses of `sx` prop to `css`
3. Update any style selectors like `&:disabled` to their new equivalents
4. Test in Storybook to verify appearance and functionality
5. Document any component-specific migration notes

## Development Commands

```bash
# Install dependencies
npm install

# Start Storybook for component development and testing
npm run storybook

# Build the component library
npm run build

# Prepare the package for publishing
npm run prepare
```

## Component Status

| Component | Status | Notes |
|-----------|--------|-------|
| GlobalButtonV2 | ✅ Updated | Replaced `sx` with `css`, updated disabled state selector |
| [Other Components] | ⏳ Pending | Need to be checked for compatibility |

## Troubleshooting Common Issues

### TypeScript Errors

- If you see TypeScript errors about missing props, check if prop names have changed in Chakra UI v3
- Component prop types may need manual updates to match the new Chakra API
- Button variants need to match the new valid values

### Styling Issues

- Components may appear unstyled if they still use `sx` instead of `css`
- Theme tokens should be checked for compatibility with v3
- Disabled styles may not apply properly without the `data-disabled` selector

## Testing Guidelines

1. Verify all component variants render correctly in Storybook
2. Test interactive states: hover, focus, active, disabled
3. Check responsiveness across different breakpoints
4. Ensure accessibility is maintained
5. Verify that event handlers work as expected

## Contribution Guidelines

1. Create a branch for each component update
2. Follow the migration patterns established in updated components
3. Update Storybook stories to showcase all variants and states
4. Document any component-specific migration details
5. Create atomic commits that reference the specific component being updated

## References

- [Chakra UI v3 Migration Guide](https://www.chakra-ui.com/docs/get-started/migration)
- [Chakra UI v3 Component Documentation](https://www.chakra-ui.com/docs/components)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)