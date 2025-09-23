# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository contains scripts for automatically adding data-testid attributes to Chakra UI components in React JSX files. These scripts are useful for improving testability of React applications built with Chakra UI by automatically adding test locators.

## Available Scripts

### JavaScript Implementation

The primary JavaScript script for adding test IDs:

```bash
# Run the script on a test file
npm run test

# Run the script on a specific JSX file
node add_chakra_testids.js path/to/your-file.jsx
```

### Python Implementations

Various Python implementations are available, each with progressively improved capabilities:

```bash
# Run the basic Python implementation
python add_test_ids.py

# Run the advanced implementation
python add_test_ids_advanced.py

# Run the parser-based implementation
python add_test_ids_parser.py

# Run the v4 implementation
python add_test_ids_v4.py

# Run the v5 implementation
python add_test_ids_v5.py

# Run the v6 implementation (with multi-line support)
python add_test_ids_v6.py
python add_test_ids_v6_multiline.py

# Run the final implementation
python add_test_ids_final.py

# Run the fixed implementation
python add_test_ids_fixed.py
```

## Architecture Overview

This project consists of two main implementations:

1. **JavaScript Implementation (add_chakra_testids.js)**
   - Uses Babel to parse JSX files
   - Modifies the AST (Abstract Syntax Tree)
   - Handles both simple and complex component structures
   - Adds test IDs based on component type and attributes
   - Preserves code formatting

2. **Python Implementations**
   - Multiple iterations with progressive improvements
   - Early versions use regex-based approaches
   - Later versions handle complex JSX structures
   - Final versions support multi-line components
   - Generate test IDs based on component properties

Each implementation follows these general steps:
1. Detect Chakra UI component imports
2. Identify components in JSX
3. Generate meaningful test IDs based on component properties
4. Insert data-testid attributes
5. Output the modified code to a new file

## Development Guidelines

When working with this codebase:

1. **Testing Changes:**
   - Test any modifications with the sample `test.jsx` file
   - Compare output with existing result files (e.g., `test_v6_result.jsx`)
   - Check that test IDs are properly generated and unique

2. **Adding Features:**
   - Follow existing patterns for test ID generation
   - Update ID generation logic for new Chakra UI components
   - Maintain backwards compatibility

3. **Best Practices:**
   - Preserve existing code formatting when modifying JSX
   - Create descriptive, predictable test IDs
   - Handle edge cases (nested components, multi-line tags)
   - Account for different import patterns

4. **Making Updates:**
   - For small changes and bugfixes, modify the existing script directly
   - For significant updates or new features, create a new version file (e.g., `add_test_ids_v7.py` or `add_chakra_testids_v2.js`)
   - Include comments explaining the changes made
   - Create corresponding result files for testing (e.g., `test_v7_result.jsx`)