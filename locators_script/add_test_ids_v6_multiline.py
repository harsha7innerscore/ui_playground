#!/usr/bin/env python3
"""
Script v6 (multiline): Add data-testid attributes to Chakra UI components in JSX files.
This version handles both single-line and multi-line JSX elements.
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
        # Component hierarchy
        self.path_stack = []

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

    def _get_component_description(self, jsx_tag, component_name):
        """Extract meaningful description from component attributes."""
        description = component_name.lower()

        # Check for className prop
        class_match = re.search(r'className=\{(?:[\w\.]+\.)?(\w+)\}', jsx_tag)
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

        # Check for src prop (for Image components)
        src_match = re.search(r'src=\{([^}]+)\}', jsx_tag)
        if src_match and component_name.lower() == 'image':
            src_var = src_match.group(1)
            if '.' in src_var:
                src_parts = src_var.split('.')
                return f"{description}-{src_parts[-1]}"
            return f"{description}-src"

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

    def process_file(self, file_path):
        """Process a JSX file to add data-testid attributes to Chakra components."""
        print(f"\nProcessing file: {file_path}")

        # Reset state for this file
        self.component_counts = {}
        self.added_test_ids = []
        self.path_stack = []
        self.chakra_components = set()
        self.custom_components = set()

        # Read the file content
        with open(file_path, 'r') as f:
            original_content = f.read()

        # Extract Chakra UI components from imports
        self.extract_chakra_imports(original_content)

        # If no components were found, nothing to do
        if not self.chakra_components:
            print("No Chakra UI components found to process.")
            return 0

        # Process multi-line components as a special case
        # This approach is more thorough and handles components that span multiple lines

        # Build a regex pattern for all components
        component_pattern = '|'.join(map(re.escape, self.chakra_components))

        # Function to process a matched component
        def process_component(match_text, component_name):
            # Skip if it already has a data-testid
            if 'data-testid=' in match_text:
                return match_text

            # Generate the test ID
            base_id = self._get_component_description(match_text, component_name)
            test_id = self._generate_unique_test_id(base_id)
            self.added_test_ids.append(test_id)

            # Add the data-testid attribute to the component
            if '/>' in match_text:  # Self-closing tag
                return match_text.replace('/>', f' data-testid="{test_id}" />')
            else:  # Opening tag
                # Track for hierarchy
                self.path_stack.append(test_id)
                return match_text.replace('>', f' data-testid="{test_id}">')

        # Process the content line by line to handle both single and multi-line components
        lines = original_content.split('\n')
        in_component = False
        current_component = None
        component_lines = []
        result_lines = []

        i = 0
        while i < len(lines):
            line = lines[i]

            # Check for component start
            component_start_match = re.search(r'<(' + component_pattern + r')([\s>])', line)

            if not in_component and component_start_match:
                # Found a new component start
                component_name = component_start_match.group(1)

                # Check if the component ends on this line
                if '/>' in line:
                    # Self-closing tag - process the entire component on this line
                    component_text = line[component_start_match.start():line.find('/>') + 2]
                    processed_text = process_component(component_text, component_name)
                    result_lines.append(line.replace(component_text, processed_text))
                elif '>' in line[component_start_match.end():]:
                    # Opening tag ends on this line
                    component_text = line[component_start_match.start():line.find('>', component_start_match.end()) + 1]
                    processed_text = process_component(component_text, component_name)
                    result_lines.append(line.replace(component_text, processed_text))
                else:
                    # Start of a multi-line component
                    in_component = True
                    current_component = component_name
                    component_lines = [line]
                    i += 1  # Move to the next line

                    # Collect all lines of this component
                    while i < len(lines):
                        line = lines[i]
                        component_lines.append(line)

                        if '/>' in line:
                            # Found end of self-closing tag
                            break
                        elif '>' in line:
                            # Found end of opening tag
                            break

                        i += 1

                    # Process the complete multi-line component
                    component_text = '\n'.join(component_lines)
                    processed_text = process_component(component_text, current_component)

                    # Add the processed lines
                    result_lines.extend(processed_text.split('\n'))
                    in_component = False
            else:
                # Not a component start or already inside a component
                result_lines.append(line)

            i += 1

        # Join all lines back together
        modified_content = '\n'.join(result_lines)

        # Write modified content to output file
        file_name = Path(file_path).stem
        output_path = Path(file_path).parent / f"{file_name}_v6_multiline_result.jsx"

        with open(output_path, 'w') as f:
            f.write(modified_content)

        print(f"✅ Added {len(self.added_test_ids)} data-testid attributes")
        print(f"✅ Modified file saved as: {output_path}")

        return len(self.added_test_ids)

    def print_summary(self):
        """Print summary of added test IDs."""
        print("\nSummary of added test IDs by component type:")
        component_types = {}

        for test_id in self.added_test_ids:
            component_type = test_id.split('-')[0]
            component_types[component_type] = component_types.get(component_type, 0) + 1

        for component, count in sorted(component_types.items()):
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
    processor = ChakraTestIdAdder()
    num_added = processor.process_file(jsx_file)

    if num_added > 0:
        # Print summary
        processor.print_summary()

    return 0

if __name__ == "__main__":
    sys.exit(main())