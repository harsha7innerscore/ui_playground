#!/usr/bin/env python3
"""
Script to add data-testid attributes to Chakra UI components in JSX files.
This version uses regular expressions with special handling for JSX syntax.
"""
import re
import sys
import os
from pathlib import Path

class JSXProcessor:
    def __init__(self):
        # Chakra UI components to add data-testid attributes to
        self.chakra_components = [
            'Box', 'Flex', 'VStack', 'Image', 'CustomToolTip',
            'RequestSentModal', 'HStack', 'Text', 'Button', 'Container'
        ]
        # Track component counts for unique IDs
        self.component_counts = {}
        # Record all added test IDs
        self.added_test_ids = []
        # Current path elements to build hierarchical test IDs
        self.path_stack = []

    def _get_component_description(self, jsx_tag, component_name):
        """Extract meaningful description from component attributes."""
        description = component_name.lower()

        # Check for className prop
        class_match = re.search(r'className=\{(?:Styles\.|Styles\?\.|)(\w+)\}', jsx_tag)
        if class_match:
            return f"{description}-{class_match.group(1)}"

        # Check for string className
        string_class_match = re.search(r'className=["\']([^"\']+)["\']', jsx_tag)
        if string_class_match:
            class_name = re.sub(r'\s+', '-', string_class_match.group(1)).lower()
            return f"{description}-{class_name}"

        # Check for id prop
        id_match = re.search(r'id=["\']([^"\']+)["\']', jsx_tag) or re.search(r'id=\{["\']?([^}"\']+)["\']?\}', jsx_tag)
        if id_match:
            return f"{description}-{id_match.group(1)}"

        # Check for key prop for list items
        key_match = re.search(r'key=\{([^}]+)\}', jsx_tag)
        if key_match:
            return f"{description}-item"

        # Check if it contains specific text content
        if re.search(r'>\s*([A-Za-z0-9 ]+)\s*</', jsx_tag):
            text_content = re.search(r'>\s*([A-Za-z0-9 ]+)\s*</', jsx_tag).group(1).strip()
            if text_content and len(text_content) < 20:  # Only use short text
                text_id = re.sub(r'[^a-zA-Z0-9]', '-', text_content.lower())
                return f"{description}-{text_id}"

        # Use parent component context if available
        if self.path_stack:
            parent = self.path_stack[-1].split('-')[0]  # Get base component type
            return f"{parent}-{description}"

        return description

    def _generate_unique_test_id(self, base_id):
        """Generate a unique test ID based on the component description."""
        if base_id in self.component_counts:
            self.component_counts[base_id] += 1
        else:
            self.component_counts[base_id] = 1

        return f"{base_id}-{self.component_counts[base_id]}"

    def _add_test_id_to_tag(self, match):
        """Add a data-testid attribute to a component opening tag."""
        full_tag = match.group(0)
        component_name = match.group(1)

        # Skip if already has a data-testid
        if 'data-testid=' in full_tag:
            # If this is an opening tag, track it for hierarchy
            if not full_tag.rstrip().endswith('/>'):
                existing_id = re.search(r'data-testid=["\']([^"\']+)["\']', full_tag)
                if existing_id:
                    self.path_stack.append(existing_id.group(1))
            return full_tag

        # Generate component description based on props and context
        base_id = self._get_component_description(full_tag, component_name)
        test_id = self._generate_unique_test_id(base_id)

        # Add to tracking
        self.added_test_ids.append(test_id)

        # Add the test ID attribute to the tag
        if full_tag.rstrip().endswith('/>'):  # Self-closing tag
            result = full_tag.rstrip()[:-2] + f' data-testid="{test_id}" />'
        else:  # Opening tag
            result = full_tag.rstrip()[:-1] + f' data-testid="{test_id}">'
            # Add to path stack for nested components
            self.path_stack.append(test_id)

        return result

    def _process_closing_tag(self, match):
        """Process a closing JSX tag and maintain the component hierarchy."""
        component_name = match.group(1)
        if component_name in self.chakra_components and self.path_stack:
            self.path_stack.pop()
        return match.group(0)

    def process_file(self, file_path):
        """Process a JSX file to add data-testid attributes to Chakra components."""
        print(f"Processing file: {file_path}")

        # Reset state for this file
        self.component_counts = {}
        self.added_test_ids = []
        self.path_stack = []

        # Read the file content
        with open(file_path, 'r') as f:
            content = f.read()

        # Regex patterns for opening and closing tags
        component_pattern = '|'.join(self.chakra_components)
        opening_tag_pattern = r'<(' + component_pattern + r')([\s\n][^>]*?)(?:>|/>)'
        closing_tag_pattern = r'</(' + component_pattern + r')>'

        # First process all opening tags
        modified_content = re.sub(opening_tag_pattern, self._add_test_id_to_tag, content)

        # Reset path stack for second pass
        self.path_stack = []

        # Process closing tags to maintain hierarchy
        modified_content = re.sub(closing_tag_pattern, self._process_closing_tag, modified_content)

        # Write modified content to output file
        file_name = Path(file_path).stem
        output_path = Path(file_path).parent / f"{file_name}-with-ids.jsx"

        with open(output_path, 'w') as f:
            f.write(modified_content)

        print(f"✅ Added {len(self.added_test_ids)} data-testid attributes")
        print(f"✅ Modified file saved as: {output_path}")

        return len(self.added_test_ids)

    def print_summary(self):
        """Print summary of added test IDs."""
        print("\nSummary of added test IDs:")
        for component, count in sorted(self.component_counts.items()):
            print(f"  {component}: {count}")

        print("\nSample of added test IDs:")
        for i, test_id in enumerate(self.added_test_ids[:10]):  # Show first 10
            print(f"  {i+1}. {test_id}")

        if len(self.added_test_ids) > 10:
            print(f"  ... and {len(self.added_test_ids) - 10} more")

def main():
    # Get script directory
    script_dir = Path(__file__).parent

    # Path to the JSX file
    jsx_file = script_dir / "test.jsx"

    # Check if file exists
    if not jsx_file.exists():
        print(f"Error: File not found: {jsx_file}")
        return 1

    # Process the file
    processor = JSXProcessor()
    num_added = processor.process_file(jsx_file)

    # Print summary
    processor.print_summary()

    print(f"\nTotal: {num_added} data-testid attributes added")
    return 0

if __name__ == "__main__":
    sys.exit(main())