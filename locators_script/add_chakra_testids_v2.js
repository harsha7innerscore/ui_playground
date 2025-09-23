#!/usr/bin/env node

/**
 * add_chakra_testids_v2.js
 *
 * An enhanced script to automatically add data-testid attributes to both Chakra UI elements
 * and standard HTML5 elements in a JSX file.
 *
 * This version extends the original script to handle HTML elements while maintaining
 * backward compatibility with Chakra UI components.
 *
 * Usage: node add_chakra_testids_v2.js <input-file.jsx> [--include-html]
 * Options:
 *   --include-html: Add data-testid to standard HTML elements (default: true)
 *   --html-only: Only process HTML elements, ignore Chakra components
 *   --chakra-only: Only process Chakra components, ignore HTML elements (original behavior)
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Check for input file
const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Please provide an input file: node add_chakra_testids_v2.js <input-file.jsx> [options]');
  process.exit(1);
}

// Process options
const options = {
  includeHtml: true,  // Default to including HTML elements
  htmlOnly: false,
  chakraOnly: false
};

args.slice(1).forEach(arg => {
  if (arg === '--include-html') options.includeHtml = true;
  if (arg === '--html-only') {
    options.htmlOnly = true;
    options.chakraOnly = false;
  }
  if (arg === '--chakra-only') {
    options.chakraOnly = true;
    options.htmlOnly = false;
    options.includeHtml = false;
  }
});

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

// If no components were found and we're not in HTML-only mode, use common Chakra components as fallback
if (chakraComponentsArray.length === 0 && !options.htmlOnly) {
  console.log('No Chakra UI imports found. Using default components list.');
  const defaultComponents = ['Box', 'Flex', 'VStack', 'HStack', 'Image', 'Text', 'Button', 'Container', 'Input'];
  defaultComponents.forEach(comp => chakraComponents.add(comp));
}

// Common HTML elements to add testIds to
const htmlElements = new Set([
  // Structure elements
  'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav',

  // Form elements
  'form', 'input', 'button', 'select', 'option', 'textarea', 'label',

  // Table elements
  'table', 'thead', 'tbody', 'tr', 'th', 'td',

  // Media elements
  'img', 'video', 'audio',

  // Interactive elements
  'a', 'dialog', 'details', 'summary',

  // Text formatting
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',

  // Semantic elements
  'figure', 'figcaption', 'time', 'code'
]);

console.log('HTML elements that will receive test IDs:', Array.from(htmlElements).join(', '));

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

// Counters to generate unique test IDs
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
  if (!attributeFound && (lowerName === 'image' || lowerName === 'img')) {
    const srcAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'src'
    );

    if (srcAttr) {
      if (t.isJSXExpressionContainer(srcAttr.value)) {
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
      } else if (t.isStringLiteral(srcAttr.value)) {
        // Handle src="path/to/image.jpg"
        const srcPath = srcAttr.value.value;
        const fileName = srcPath.split('/').pop().split('.')[0];
        suffix = fileName;
        attributeFound = true;
      }
    }
  }

  // For label or text, try to get the text content
  if (!attributeFound && ['label', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(lowerName)) {
    // For these elements, we'll assign a type-based name
    suffix = `text-element`;
  }

  // For buttons, try to get text content or type
  if (!attributeFound && lowerName === 'button') {
    const typeAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'type'
    );

    if (typeAttr && t.isStringLiteral(typeAttr.value)) {
      suffix = typeAttr.value.value;
      attributeFound = true;
    } else {
      suffix = 'button';
    }
  }

  // For inputs, try to get type, name or placeholder
  if (!attributeFound && lowerName === 'input') {
    const typeAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'type'
    );

    if (typeAttr && t.isStringLiteral(typeAttr.value)) {
      suffix = `${typeAttr.value.value}`;
      attributeFound = true;
    } else {
      const nameAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'name'
      );

      if (nameAttr && t.isStringLiteral(nameAttr.value)) {
        suffix = nameAttr.value.value;
        attributeFound = true;
      } else {
        const placeholderAttr = attributes.find(
          attr => t.isJSXAttribute(attr) && attr.name.name === 'placeholder'
        );

        if (placeholderAttr && t.isStringLiteral(placeholderAttr.value)) {
          // Use first word of placeholder
          suffix = placeholderAttr.value.value.split(' ')[0].toLowerCase();
          attributeFound = true;
        }
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
const componentTypesCount = {
  chakra: 0,
  html: 0
};

// Process the AST and add data-testid attributes
traverse(ast, {
  JSXOpeningElement(path) {
    const node = path.node;
    const componentName = node.name.name;

    // Determine if this is a Chakra component or HTML element we want to process
    const isChakraComponent = chakraComponents.has(componentName);
    const isHtmlElement = htmlElements.has(componentName.toLowerCase());

    // Skip processing based on options
    if ((options.htmlOnly && !isHtmlElement) ||
        (options.chakraOnly && !isChakraComponent) ||
        (!isChakraComponent && !isHtmlElement && !options.includeHtml)) {
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

    // Track component type
    if (isChakraComponent) {
      componentTypesCount.chakra++;
    } else {
      componentTypesCount.html++;
    }

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
if (componentTypesCount.chakra > 0) {
  console.log(`  Chakra UI components: ${componentTypesCount.chakra}`);
}
if (componentTypesCount.html > 0) {
  console.log(`  HTML elements: ${componentTypesCount.html}`);
}

// Print type breakdown
console.log('\nDetailed breakdown:');
Object.keys(counters).sort().forEach(type => {
  console.log(`  ${type}: ${counters[type]}`);
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