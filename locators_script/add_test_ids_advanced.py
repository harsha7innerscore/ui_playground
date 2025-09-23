#!/usr/bin/env python3
import re
import os
import sys
from pathlib import Path

class TestIdAdder:
    def __init__(self):
        # Chakra UI components to add data-testid to
        self.CHAKRA_COMPONENTS = ['Box', 'Flex', 'VStack', 'Image', 'CustomToolTip', 'RequestSentModal']
        # Counter for unique IDs
        self.component_counts = {}
        # Track parent-child relationships
        self.parent_stack = []
        # Store added test IDs for reporting
        self.added_test_ids = []

    def get_component_context(self, match_text, component_name):
        """Extract context from component props."""
        # Check for className
        class_match = re.search(r'className=\{(?:Styles\.|Styles\?\.)?(\w+)\}', match_text)
        if class_match:
            return f"{component_name.lower()}-{class_match.group(1)}"

        # Check for inline className
        inline_class_match = re.search(r'className=["\']([^"\']+)["\']', match_text)
        if inline_class_match:
            # Transform spaces and special chars to dashes
            class_name = re.sub(r'[^\w]', '-', inline_class_match.group(1))
            return f"{component_name.lower()}-{class_name}"

        # Check for key prop for list items
        key_match = re.search(r'key=\{([^}]+)\}', match_text)
        if key_match:
            key_text = key_match.group(1)
            # If key is a variable, just use 'item'
            if re.match(r'^\w+$', key_text):
                return f"{component_name.lower()}-item"
            else:
                return f"{component_name.lower()}-list-item"

        # If we have parent context, use that
        if self.parent_stack:
            parent_context = self.parent_stack[-1].split('-')[0]  # Get main component type
            return f"{parent_context}-{component_name.lower()}"

        return component_name.lower()

    def process_element(self, match):
        """Process a matched JSX element."""
        component_name = match.group(1)
        element_content = match.group(0)

        # Skip if it already has a data-testid
        if re.search(r'data-testid=', element_content):
            # Push to parent stack if this is an opening tag
            if not element_content.rstrip().endswith('/>'):
                test_id_match = re.search(r'data-testid=["\'](.*?)["\']', element_content)
                if test_id_match:
                    self.parent_stack.append(test_id_match.group(1))
            return element_content

        # Generate test ID based on component context
        base_test_id = self.get_component_context(element_content, component_name)

        # Ensure uniqueness
        if base_test_id in self.component_counts:
            self.component_counts[base_test_id] += 1
            test_id = f"{base_test_id}-{self.component_counts[base_test_id]}"
        else:
            self.component_counts[base_test_id] = 1
            test_id = f"{base_test_id}-1"

        # Store the added test ID for reporting
        self.added_test_ids.append(test_id)

        # Add data-testid attribute
        if element_content.rstrip().endswith('/>'):  # Self-closing tag
            modified = element_content.rstrip()[:-2] + f' data-testid="{test_id}" />'
        else:  # Opening tag
            modified = element_content.rstrip()[:-1] + f' data-testid="{test_id}">'
            # Add this element to the parent stack
            self.parent_stack.append(test_id)

        return modified

    def process_end_tag(self, match):
        """Process a closing JSX tag."""
        component_name = match.group(1)

        # If this is a component we're tracking, pop from parent stack
        if component_name in self.CHAKRA_COMPONENTS and self.parent_stack:
            self.parent_stack.pop()

        return match.group(0)

    def process_file(self, file_path):
        """Process a JSX file to add data-testid attributes."""
        print(f"Processing file: {file_path}")

        with open(file_path, 'r') as f:
            content = f.read()

        # Reset tracking for this file
        self.component_counts = {}
        self.parent_stack = []
        self.added_test_ids = []

        # Build regex patterns
        component_pattern = '|'.join(self.CHAKRA_COMPONENTS)
        open_tag_pattern = r'<(' + component_pattern + r')([\s\S]*?)(?:>|/>)'
        close_tag_pattern = r'</(' + component_pattern + r')>'

        # First, process all opening tags
        modified_content = re.sub(open_tag_pattern, self.process_element, content)

        # Reset parent stack (we'll rebuild it in the next pass)
        self.parent_stack = []

        # Then process all closing tags to maintain parent-child relationships
        modified_content = re.sub(close_tag_pattern, self.process_end_tag, modified_content)

        # Write the modified content to a new file
        file_name = Path(file_path).stem
        output_path = Path(file_path).parent / f"{file_name}-with-ids.jsx"

        with open(output_path, 'w') as f:
            f.write(modified_content)

        print(f"Added {len(self.added_test_ids)} data-testid attributes")
        print(f"Modified file saved as: {output_path}")

        return self.component_counts, self.added_test_ids

def main():
    # Get the directory of this script
    script_dir = Path(__file__).parent

    # Path to the JSX file
    jsx_file = script_dir / "test.jsx"

    if not jsx_file.exists():
        print(f"Error: File not found: {jsx_file}")
        return 1

    adder = TestIdAdder()
    component_counts, added_test_ids = adder.process_file(jsx_file)

    # Print summary
    print("\nSummary of added data-testid attributes:")
    for component, count in component_counts.items():
        print(f"  {component}: {count}")

    print("\nSample of added test IDs:")
    for i, test_id in enumerate(added_test_ids[:10]):  # Show first 10
        print(f"  {test_id}")

    if len(added_test_ids) > 10:
        print(f"  ... and {len(added_test_ids) - 10} more")

    return 0

if __name__ == "__main__":
    sys.exit(main())