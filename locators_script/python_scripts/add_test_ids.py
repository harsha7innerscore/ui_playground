#!/usr/bin/env python3
import re
import os
from pathlib import Path

# Chakra UI components to add data-testid to
CHAKRA_COMPONENTS = ['Box', 'Flex', 'VStack', 'Image', 'CustomToolTip', 'RequestSentModal']

def process_file(file_path):
    """Process a JSX file to add data-testid attributes to Chakra UI components."""
    print(f"Processing file: {file_path}")

    with open(file_path, 'r') as f:
        content = f.read()

    # Get the component name from className or context
    def get_component_context(match, component_name):
        # Look for className prop
        class_match = re.search(r'className={[^}]*?\.(\w+)}', match.group(0))
        if class_match:
            return f"{component_name.lower()}-{class_match.group(1)}"

        # Look for key prop
        key_match = re.search(r'key={(\w+)}', match.group(0))
        if key_match:
            return f"{component_name.lower()}-item-{key_match.group(1)}"

        return component_name.lower()

    # Keep track of component counts to make unique IDs
    component_counts = {}

    # Function to replace each Chakra component with one that has data-testid
    def add_test_id(match):
        component_name = match.group(1)

        # Skip if it already has a data-testid
        if 'data-testid=' in match.group(0):
            return match.group(0)

        # Generate base test ID
        base_test_id = get_component_context(match, component_name)

        # Ensure uniqueness
        if base_test_id in component_counts:
            component_counts[base_test_id] += 1
            test_id = f"{base_test_id}-{component_counts[base_test_id]}"
        else:
            component_counts[base_test_id] = 1
            test_id = f"{base_test_id}-1"

        # Add data-testid attribute before the closing angle bracket
        # Handle both self-closing and normal opening tags
        if match.group(0).rstrip().endswith('/>'):  # Self-closing tag
            replacement = match.group(0).rstrip()[:-2] + f' data-testid="{test_id}" />'
        else:  # Normal opening tag
            replacement = match.group(0).rstrip()[:-1] + f' data-testid="{test_id}">'

        return replacement

    # Build regex pattern for all Chakra components
    component_pattern = '|'.join(CHAKRA_COMPONENTS)
    pattern = r'<(' + component_pattern + r')([\s\S]*?)(?:>|/>)'

    # Replace all Chakra components with ones that have data-testid
    modified_content = re.sub(pattern, add_test_id, content)

    # Write the modified content to a new file with "-with-ids" suffix
    file_name = Path(file_path).stem
    output_path = Path(file_path).parent / f"{file_name}-with-ids.jsx"

    with open(output_path, 'w') as f:
        f.write(modified_content)

    print(f"Added {sum(component_counts.values())} data-testid attributes")
    print(f"Modified file saved as: {output_path}")
    return component_counts

def main():
    # Get the directory of this script
    script_dir = Path(__file__).parent

    # Path to the JSX file
    jsx_file = script_dir / "test.jsx"

    if not jsx_file.exists():
        print(f"Error: File not found: {jsx_file}")
        return

    component_counts = process_file(jsx_file)

    # Print summary
    print("\nSummary of added data-testid attributes:")
    for component, count in component_counts.items():
        print(f"  {component}: {count}")

if __name__ == "__main__":
    main()