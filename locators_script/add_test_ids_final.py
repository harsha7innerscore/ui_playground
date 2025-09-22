#!/usr/bin/env python3
"""
Final Script: Add data-testid attributes to Chakra UI components in JSX files.
This version dynamically detects Chakra UI imports and handles both single-line and multi-line components.
"""
import re
import sys
import os
from pathlib import Path

class ChakraTestIdAdder:
    def __init__(self):
        # Common Chakra UI packages
        self.chakra_packages = [
            '@chakra-ui/react',
            '@chakra-ui/core',
            '@chakra-ui/button',
            '@chakra-ui/layout',
            '@chakra-ui/form-control',
            '@chakra-ui/icons',
            '@chakra-ui'  # Catch-all for any Chakra imports
        ]
        # Will be populated dynamically from imports
        self.chakra_components = set()
        # Track additional custom components that might be chakra-based
        self.custom_components = set()
        # Component counts for unique IDs
        self.component_counts = {}
        # Added test IDs
        self.added_test_ids = []
        # Track component types
        self.component_types = {}

    def extract_chakra_imports(self, content):
        """Extract Chakra UI component names from import statements."""
        # Handle named imports: import { Box, Flex, ... } from '@chakra-ui/react'
        named_import_pattern = r'import\s+\{\s*([\w\s,]+)\s*\}\s+from\s+[\'"](' + '|'.join(self.chakra_packages) + ')[\'"]'
        named_matches = re.finditer(named_import_pattern, content)

        for match in named_matches:
            import_names = match.group(1).split(',')
            for name in import_names:
                component = name.strip()
                if component:
                    self.chakra_components.add(component)

        # Handle default imports: import Box from '@chakra-ui/react/dist/Box'
        default_import_pattern = r'import\s+(\w+)\s+from\s+[\'"](?:' + '|'.join(self.chakra_packages) + r')(?:\/[\w\/]+)?[\'"]'
        default_matches = re.finditer(default_import_pattern, content)

        for match in default_matches:
            self.chakra_components.add(match.group(1))

        # Look for custom components that might be Chakra-based
        # This is heuristic-based and might need adjustment
        custom_component_pattern = r'import\s+(\w+(?:Tool|Modal|Tooltip|Container|Button|Box|Card|Element))\s+from'
        custom_matches = re.finditer(custom_component_pattern, content)

        for match in custom_matches:
            custom_component = match.group(1)
            if not any(custom_component in s for s in self.chakra_components):
                self.custom_components.add(custom_component)

        print(f"Detected Chakra UI components: {', '.join(sorted(self.chakra_components))}")
        if self.custom_components:
            print(f"Detected potential custom Chakra components: {', '.join(sorted(self.custom_components))}")

        # If no Chakra components were found, use common ones as fallback
        if not self.chakra_components:
            self.chakra_components = {'Box', 'Flex', 'VStack', 'HStack', 'Image', 'Text', 'Button', 'Container', 'Input'}
            print(f"No Chakra UI imports found. Using default components: {', '.join(sorted(self.chakra_components))}")

        # Add custom components to the list
        self.chakra_components.update(self.custom_components)

    def _get_component_description(self, attributes, component_name):
        """Extract meaningful description from component attributes."""
        description = component_name.lower()

        # Check for className prop
        class_match = re.search(r'className=\{(?:[\w\.]+\.)?(\w+)\}', attributes)
        if class_match:
            return f"{description}-{class_match.group(1)}"

        # Check for string className
        string_class_match = re.search(r'className=["\']([^"\']+)["\']', attributes)
        if string_class_match:
            class_name = re.sub(r'\s+', '-', string_class_match.group(1)).lower()
            return f"{description}-{class_name}"

        # Check for id prop
        id_match = re.search(r'id=["\']([^"\']+)["\']', attributes) or re.search(r'id=\{["\']?([^}"\']+)["\']?\}', attributes)
        if id_match:
            return f"{description}-{id_match.group(1)}"

        # Check for src prop for images
        if component_name.lower() == 'image':
            src_match = re.search(r'src=\{([^}]+)\}', attributes)
            if src_match:
                src_var = src_match.group(1).strip()
                if '.' in src_var:
                    src_parts = src_var.split('.')
                    return f"{description}-{src_parts[-1].strip()}"
                return f"{description}-{src_var.replace(' ', '-')}"

        return description

    def _generate_test_id(self, component_name, attributes):
        """Generate a unique test ID for a component."""
        base_id = self._get_component_description(attributes, component_name)

        if base_id in self.component_counts:
            self.component_counts[base_id] += 1
        else:
            self.component_counts[base_id] = 1

        test_id = f"{base_id}-{self.component_counts[base_id]}"
        self.added_test_ids.append(test_id)

        # Track component types
        component_type = component_name.lower()
        self.component_types[component_type] = self.component_types.get(component_type, 0) + 1

        return test_id

    def process_file(self, file_path):
        """Process a JSX file to add data-testid attributes to all Chakra UI components."""
        print(f"\nProcessing file: {file_path}")

        # Reset state
        self.component_counts = {}
        self.added_test_ids = []
        self.component_types = {}

        # Read the file content
        with open(file_path, 'r') as f:
            content = f.read()

        # Extract Chakra UI components
        self.extract_chakra_imports(content)

        # Prepare regex pattern for components
        component_pattern = '|'.join(map(re.escape, self.chakra_components))

        # Find the positions of all relevant Chakra components
        component_positions = []

        # First pass: Find all component positions
        for component in self.chakra_components:
            # Regex pattern for component opening tag
            opening_pattern = re.compile(r'<' + re.escape(component) + r'\s+')

            # Find all matches
            for match in opening_pattern.finditer(content):
                start_pos = match.start()

                # Find the closing ">" or "/>" of this tag
                tag_content = content[start_pos:]

                # Handle multi-line components - find the end of the opening tag
                tag_end = 0
                bracket_count = 0
                in_quotes = False
                quote_char = None

                for i, char in enumerate(tag_content):
                    if char == '"' or char == "'":
                        if not in_quotes:
                            in_quotes = True
                            quote_char = char
                        elif char == quote_char:
                            in_quotes = False

                    elif not in_quotes:
                        if char == '{':
                            bracket_count += 1
                        elif char == '}':
                            bracket_count -= 1
                        elif char == '>' and bracket_count == 0:
                            # Found the end of the tag
                            tag_end = i
                            break

                # Skip if we couldn't find the end
                if tag_end == 0:
                    continue

                # Check if it's a self-closing tag
                is_self_closing = tag_content[tag_end-1] == '/'

                # Check if it already has a data-testid attribute
                tag_attributes = tag_content[:tag_end]
                if 'data-testid=' in tag_attributes:
                    continue

                # Generate a test ID
                test_id = self._generate_test_id(component, tag_attributes)

                # Add position information
                component_positions.append({
                    'start': start_pos,
                    'end': start_pos + tag_end,
                    'is_self_closing': is_self_closing,
                    'test_id': test_id,
                    'component': component
                })

        # Sort positions in reverse order to avoid messing up indices
        component_positions.sort(key=lambda x: x['start'], reverse=True)

        # Second pass: Add data-testid attributes
        modified_content = content
        for pos in component_positions:
            start = pos['start']
            end = pos['end']
            test_id = pos['test_id']

            # Extract the tag
            tag = modified_content[start:end]

            # Add data-testid attribute before the closing ">" or "/>"
            if pos['is_self_closing']:
                # For self-closing tags ending with '/>'
                closing_idx = tag.rfind('/>')
                if closing_idx > 0:
                    modified_tag = tag[:closing_idx].rstrip() + f' data-testid="{test_id}" />'
            else:
                # For opening tags ending with '>'
                closing_idx = tag.rfind('>')
                if closing_idx > 0:
                    modified_tag = tag[:closing_idx].rstrip() + f' data-testid="{test_id}">'

            # Replace the tag in the content
            modified_content = modified_content[:start] + modified_tag + modified_content[end:]

        # Write the modified content to output file
        file_name = Path(file_path).stem
        output_path = Path(file_path).parent / f"{file_name}_final_result.jsx"

        with open(output_path, 'w') as f:
            f.write(modified_content)

        print(f"✅ Added {len(self.added_test_ids)} data-testid attributes")
        print(f"✅ Modified file saved as: {output_path}")

        return len(self.added_test_ids)

    def print_summary(self):
        """Print summary of added test IDs."""
        print("\nSummary of added test IDs by component type:")

        for component, count in sorted(self.component_types.items()):
            print(f"  {component}: {count}")

        print("\nSample of added test IDs:")
        for i, test_id in enumerate(self.added_test_ids[:10]):
            print(f"  {i+1}. {test_id}")

        if len(self.added_test_ids) > 10:
            print(f"  ... and {len(self.added_test_ids) - 10} more")

def main():
    # Get script directory
    script_dir = Path(__file__).parent

    # Path to the JSX file
    jsx_file = script_dir / "test.jsx"

    if not jsx_file.exists():
        print(f"Error: File not found: {jsx_file}")
        return 1

    # Process the file
    processor = ChakraTestIdAdder()
    num_added = processor.process_file(jsx_file)

    if num_added > 0:
        processor.print_summary()

    return 0

if __name__ == "__main__":
    sys.exit(main())