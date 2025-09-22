#!/usr/bin/env node

/**
 * add_chakra_testids.js
 *
 * A script to automatically add data-testid attributes to Chakra UI elements in a JSX file.
 * This script uses a JavaScript parser (babel) to properly parse and modify JSX.
 *
 * Usage: node add_chakra_testids.js <input-file.jsx>
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Check for input file
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Please provide an input file: node add_chakra_testids.js <input-file.jsx>');
  process.exit(1);
}

// Get the full path to the input file
const inputFilePath = path.resolve(process.cwd(), inputFile);

// Output file path
const fileExt = path.extname(inputFilePath);
const fileName = path.basename(inputFilePath, fileExt);
const outputFilePath = path.join(path.dirname(inputFilePath), `${fileName}_with_testids${fileExt}`);

// Read the input file
let fileContent;
try {
  fileContent = fs.readFileSync(inputFilePath, 'utf8');
} catch (error) {
  console.error(`Error reading file: ${error.message}`);
  process.exit(1);
}

// Find Chakra UI imports
const chakraImportRegex = /@chakra-ui\/\w+|@chakra-ui/g;
const importRegex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/g;
const singleImportRegex = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g;

// Extract Chakra component names
let chakraComponents = new Set();
let match;

// Handle named imports: import { Box, Flex, ... } from '@chakra-ui/react'
while ((match = importRegex.exec(fileContent)) !== null) {
  const imports = match[1].split(',').map(s => s.trim());
  const packageName = match[2];

  if (packageName.match(chakraImportRegex)) {
    imports.forEach(importName => {
      // Handle 'as' imports: Button as ChakraButton
      const finalName = importName.includes(' as ')
        ? importName.split(' as ')[1].trim()
        : importName.trim();
      chakraComponents.add(finalName);
    });
  }
}

// Handle default imports: import Box from '@chakra-ui/react'
while ((match = singleImportRegex.exec(fileContent)) !== null) {
  const componentName = match[1];
  const packageName = match[2];

  if (packageName.match(chakraImportRegex)) {
    chakraComponents.add(componentName);
  }
}

// Also look for custom components that might be Chakra-based
const customComponentRegex = /import\s+(\w+(?:Tool|Modal|Tooltip|Container|Button|Box|Card|Element))\s+from/g;
while ((match = customComponentRegex.exec(fileContent)) !== null) {
  const componentName = match[1];
  if (!chakraComponents.has(componentName)) {
    chakraComponents.add(componentName);
  }
}

// Convert to array for easier logging
const chakraComponentsArray = Array.from(chakraComponents);
console.log('Detected Chakra UI components:', chakraComponentsArray.join(', '));

// If no components were found, use common Chakra components as fallback
if (chakraComponentsArray.length === 0) {
  console.log('No Chakra UI imports found. Using default components list.');
  const defaultComponents = ['Box', 'Flex', 'VStack', 'HStack', 'Image', 'Text', 'Button', 'Container', 'Input'];
  defaultComponents.forEach(comp => chakraComponents.add(comp));
}

// Parse the JSX file with babel
let ast;
try {
  ast = parser.parse(fileContent, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
} catch (error) {
  console.error(`Error parsing file: ${error.message}`);
  process.exit(1);
}

// Counter to generate unique test IDs
const counters = {};

// Function to generate a unique test ID for a component
function generateTestId(componentName, attributes) {
  // Convert component name to lowercase
  const lowerName = componentName.toLowerCase();

  // Try to extract meaningful info from attributes
  let suffix = '';
  let attributeFound = false;

  // Look for className
  const classNameAttr = attributes.find(
    attr => t.isJSXAttribute(attr) && attr.name.name === 'className'
  );

  if (classNameAttr) {
    // Extract className values
    if (t.isJSXExpressionContainer(classNameAttr.value) &&
        t.isMemberExpression(classNameAttr.value.expression)) {
      try {
        // Handle Styles.className or Styles?.className
        suffix = classNameAttr.value.expression.property.name;
        attributeFound = true;
      } catch (e) {
        // Handle any errors in property access
      }
    } else if (t.isStringLiteral(classNameAttr.value)) {
      // Handle className="some-class"
      suffix = classNameAttr.value.value.split(' ')[0].replace(/[^\w-]/g, '-');
      attributeFound = true;
    }
  }

  // If no className, look for other common props
  if (!attributeFound) {
    const idAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'id'
    );

    if (idAttr && t.isStringLiteral(idAttr.value)) {
      suffix = idAttr.value.value;
      attributeFound = true;
    }
  }

  // For Image components, try to get context from src
  if (!attributeFound && lowerName === 'image') {
    const srcAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'src'
    );

    if (srcAttr && t.isJSXExpressionContainer(srcAttr.value)) {
      try {
        if (t.isIdentifier(srcAttr.value.expression)) {
          suffix = srcAttr.value.expression.name;
          attributeFound = true;
        } else if (t.isMemberExpression(srcAttr.value.expression)) {
          suffix = srcAttr.value.expression.property.name;
          attributeFound = true;
        }
      } catch (e) {
        // Handle any errors in property access
      }
    }
  }

  // Create the base test ID
  const baseId = attributeFound ? `${lowerName}-${suffix}` : lowerName;

  // Ensure uniqueness
  if (!counters[baseId]) {
    counters[baseId] = 0;
  }

  counters[baseId]++;
  return `${baseId}-${counters[baseId]}`;
}

// Count of attributes added
let addedCount = 0;

// Process the AST and add data-testid attributes
traverse(ast, {
  JSXOpeningElement(path) {
    const node = path.node;
    const componentName = node.name.name;

    // Only process Chakra components
    if (!chakraComponents.has(componentName)) {
      return;
    }

    // Skip if already has data-testid
    const hasTestId = node.attributes.some(attr =>
      t.isJSXAttribute(attr) &&
      (attr.name.name === 'data-testid' || attr.name.name === 'data-test-id')
    );

    if (hasTestId) {
      return;
    }

    // Generate a unique test ID
    const testId = generateTestId(componentName, node.attributes);

    // Add data-testid attribute
    node.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('data-testid'),
        t.stringLiteral(testId)
      )
    );

    addedCount++;
  }
});

// Generate the modified code
const output = generate(ast, {
  retainLines: true,
  compact: false,
  jsescOption: {
    quotes: 'single',
  },
}, fileContent);

// Write the output
try {
  fs.writeFileSync(outputFilePath, output.code, 'utf8');
  console.log(`✅ Added ${addedCount} data-testid attributes`);
  console.log(`✅ Output written to: ${outputFilePath}`);
} catch (error) {
  console.error(`Error writing output: ${error.message}`);
  process.exit(1);
}

// Print component types summary
console.log('\nSummary of component types:');
const componentTypes = {};
Object.keys(counters).forEach(id => {
  const type = id.split('-')[0];
  if (!componentTypes[type]) {
    componentTypes[type] = 0;
  }
  componentTypes[type] += counters[id];
});

Object.keys(componentTypes).sort().forEach(type => {
  console.log(`  ${type}: ${componentTypes[type]}`);
});

console.log('\nExample test IDs:');
const examples = Object.keys(counters)
  .map(id => `${id}-1`)
  .slice(0, 10);

examples.forEach((id, i) => {
  console.log(`  ${i+1}. ${id}`);
});

if (Object.keys(counters).length > 10) {
  console.log(`  ... and ${Object.keys(counters).length - 10} more`);
}