#!/usr/bin/env node

/**
 * add_chakra_testids_v3.js
 *
 * Enhanced script to automatically add meaningful data-testid attributes to both Chakra UI
 * elements and standard HTML5 elements in a JSX file.
 *
 * This version generates more meaningful test IDs by:
 * 1. Extracting text content from elements
 * 2. Using nearby comment text for context
 * 3. Leveraging semantic attributes like aria-label
 * 4. Creating role-based identifiers for accessibility
 *
 * Usage: node add_chakra_testids_v3.js <input-file.jsx> [options]
 * Options:
 *   --include-html: Add data-testid to standard HTML elements (default: true)
 *   --html-only: Only process HTML elements, ignore Chakra components
 *   --chakra-only: Only process Chakra components, ignore HTML elements
 *   --comment-based: Use nearby comments for naming (default: true)
 *   --text-based: Use text content for naming (default: true)
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
  console.error('Please provide an input file: node add_chakra_testids_v3.js <input-file.jsx> [options]');
  process.exit(1);
}

// Process options
const options = {
  includeHtml: true,      // Default to including HTML elements
  htmlOnly: false,
  chakraOnly: false,
  commentBased: true,     // Use comments for naming
  textBased: true         // Use text content for naming
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
  if (arg === '--no-comment-based') options.commentBased = false;
  if (arg === '--no-text-based') options.textBased = false;
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

// Map to store leading comments for nodes
const commentMap = new Map();

// First pass to gather comments
if (options.commentBased) {
  traverse(ast, {
    enter(path) {
      // Collect leading comments
      const comments = path.node.leadingComments || [];
      if (comments.length > 0) {
        // Look for JSX elements after this comment
        const nextSibling = path.getNextSibling();
        if (nextSibling && nextSibling.isJSXElement()) {
          // Extract comment text
          const commentText = comments.map(comment => comment.value.trim()).join(' ');
          commentMap.set(nextSibling.node, commentText);
        }
      }
    }
  });
}

// Helper function to extract text content from JSX elements
function getTextFromJSXElement(node) {
  let text = '';

  // Check for string literals directly in the children
  if (node.children) {
    node.children.forEach(child => {
      if (t.isJSXText(child)) {
        // Extract text, clean it up
        const childText = child.value.trim();
        if (childText) text += childText + ' ';
      } else if (t.isJSXExpressionContainer(child)) {
        // Handle expressions like {'Some text'} or {`Template literal`}
        const expr = child.expression;
        if (t.isStringLiteral(expr)) {
          text += expr.value + ' ';
        } else if (t.isTemplateLiteral(expr)) {
          // Extract template literal content
          expr.quasis.forEach(quasi => {
            text += quasi.value.raw + ' ';
          });
        }
      }
    });
  }

  return text.trim();
}

// Helper to sanitize text for use in test IDs
function sanitizeForTestId(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    // Convert non-alphanumeric to hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 40);
}

// Function to generate a unique test ID for a component
function generateTestId(componentName, attributes, parentPath) {
  // Convert component name to lowercase
  const lowerName = componentName.toLowerCase();

  // Try to extract meaningful info from attributes
  let suffix = '';
  let attributeFound = false;

  // 1. Look for role attribute (for accessibility)
  const roleAttr = attributes.find(
    attr => t.isJSXAttribute(attr) && attr.name.name === 'role'
  );

  if (roleAttr && t.isStringLiteral(roleAttr.value)) {
    suffix = `${roleAttr.value.value}`;
    attributeFound = true;
  }

  // 2. Look for aria-label (great for accessibility and descriptive names)
  if (!attributeFound) {
    const ariaLabelAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'aria-label'
    );

    if (ariaLabelAttr && t.isStringLiteral(ariaLabelAttr.value)) {
      suffix = sanitizeForTestId(ariaLabelAttr.value.value);
      attributeFound = true;
    }
  }

  // 3. Look for title (also great for descriptive names)
  if (!attributeFound) {
    const titleAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'title'
    );

    if (titleAttr && t.isStringLiteral(titleAttr.value)) {
      suffix = sanitizeForTestId(titleAttr.value.value);
      attributeFound = true;
    }
  }

  // 4. Look for semantic props for Chakra components
  if (!attributeFound) {
    // Check for common props like 'label', 'placeholder', etc.
    ['label', 'placeholder', 'heading', 'caption', 'variant', 'size'].forEach(propName => {
      if (attributeFound) return;

      const propAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === propName
      );

      if (propAttr) {
        if (t.isStringLiteral(propAttr.value)) {
          suffix = sanitizeForTestId(propAttr.value.value);
          attributeFound = true;
        } else if (t.isJSXExpressionContainer(propAttr.value) &&
                 t.isStringLiteral(propAttr.value.expression)) {
          suffix = sanitizeForTestId(propAttr.value.expression.value);
          attributeFound = true;
        }
      }
    });
  }

  // 5. Look for className
  if (!attributeFound) {
    const classNameAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'className'
    );

    if (classNameAttr) {
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
        // Get most specific class (usually last one)
        const classes = classNameAttr.value.value.split(' ');
        let mostSpecificClass = classes[0];

        // Prefer classes that aren't utility classes
        const nonUtilityClasses = classes.filter(c =>
          !/^(flex|grid|mt-|p-|text-|bg-|w-|h-|sm:|md:|lg:|xl:)/.test(c));

        if (nonUtilityClasses.length > 0) {
          mostSpecificClass = nonUtilityClasses[0];
        }

        suffix = mostSpecificClass.replace(/[^\w-]/g, '-');
        attributeFound = true;
      }
    }
  }

  // 6. Look for id prop
  if (!attributeFound) {
    const idAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'id'
    );

    if (idAttr && t.isStringLiteral(idAttr.value)) {
      suffix = idAttr.value.value;
      attributeFound = true;
    }
  }

  // 7. For buttons, links and clickable elements, look for onClick handlers
  if (!attributeFound &&
      (lowerName === 'button' || lowerName === 'a' || attributes.some(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'onClick'
      ))) {
    // Extract function name from onClick={handleSomething}
    const onClickAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'onClick'
    );

    if (onClickAttr && t.isJSXExpressionContainer(onClickAttr.value)) {
      try {
        if (t.isIdentifier(onClickAttr.value.expression)) {
          const fnName = onClickAttr.value.expression.name;
          // Transform "handleDoSomething" -> "do-something-btn"
          let actionName = fnName
            .replace(/^(handle|on)/, '')  // Remove handle/on prefix
            .replace(/^./, c => c.toLowerCase()) // lowercase first char
            .replace(/[A-Z]/g, c => '-' + c.toLowerCase()); // Add hyphens

          suffix = `${actionName}-btn`;
          attributeFound = true;
        }
      } catch (e) {
        // Handle errors in expression extraction
      }
    }
  }

  // 8. For Image components, use src context
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
        // Extract just the filename without extension
        const fileName = srcPath.split('/').pop().split('.')[0];
        suffix = fileName;
        attributeFound = true;
      }
    }
  }

  // 9. Use text content if available and option is enabled
  if (options.textBased && !attributeFound && parentPath) {
    const jsxElement = parentPath.node;
    const textContent = getTextFromJSXElement(jsxElement);

    if (textContent) {
      // Limit text length and sanitize
      suffix = sanitizeForTestId(textContent);
      attributeFound = true;
    }
  }

  // 10. Check for comments if option is enabled
  if (options.commentBased && !attributeFound && parentPath) {
    const jsxElement = parentPath.node;
    if (commentMap.has(jsxElement)) {
      const commentText = commentMap.get(jsxElement);

      // Extract relevant parts from comment
      const keyPhrases = [
        /\b(\w+)\s+(icon|button|container|element|section|input|title|label)/i,
        /\b(\w+)\s+(name|field|area)/i,
        /\b(header|footer|navigation|sidebar|modal|dialog|popup|tooltip)/i
      ];

      let commentSuffix = '';
      for (const pattern of keyPhrases) {
        const match = commentText.match(pattern);
        if (match) {
          commentSuffix = match[0].toLowerCase().replace(/\s+/g, '-');
          break;
        }
      }

      // If no key phrases found, use beginning of comment
      if (!commentSuffix && commentText.length > 0) {
        commentSuffix = sanitizeForTestId(commentText.substring(0, 40));
      }

      if (commentSuffix) {
        suffix = commentSuffix;
        attributeFound = true;
      }
    }
  }

  // 11. For forms and inputs, add type/purpose context
  if (!attributeFound && lowerName === 'input') {
    const typeAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'type'
    );

    if (typeAttr && t.isStringLiteral(typeAttr.value)) {
      suffix = `${typeAttr.value.value}-input`;
      attributeFound = true;
    } else {
      const nameAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'name'
      );

      if (nameAttr && t.isStringLiteral(nameAttr.value)) {
        suffix = `${nameAttr.value.value}-field`;
        attributeFound = true;
      } else {
        const placeholderAttr = attributes.find(
          attr => t.isJSXAttribute(attr) && attr.name.name === 'placeholder'
        );

        if (placeholderAttr && t.isStringLiteral(placeholderAttr.value)) {
          suffix = sanitizeForTestId(placeholderAttr.value.value);
          attributeFound = true;
        }
      }
    }
  }

  // Create the base test ID with improved semantics
  let baseId;
  if (attributeFound && suffix) {
    // If suffix already has component type, don't duplicate it
    if (suffix.includes(lowerName) ||
        (lowerName === 'button' && suffix.endsWith('-btn'))) {
      baseId = suffix;
    } else {
      baseId = `${lowerName}-${suffix}`;
    }
  } else {
    // Add semantic role-based naming for common components
    switch(lowerName) {
      case 'div':
        baseId = 'container';
        break;
      case 'button':
        baseId = 'btn';
        break;
      case 'img':
      case 'image':
        baseId = 'img';
        break;
      case 'ul':
        baseId = 'list';
        break;
      case 'li':
        baseId = 'list-item';
        break;
      case 'input':
        baseId = 'input-field';
        break;
      case 'a':
        baseId = 'link';
        break;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        baseId = 'heading';
        break;
      default:
        baseId = lowerName;
    }
  }

  // Ensure uniqueness
  if (!counters[baseId]) {
    counters[baseId] = 0;
  }

  counters[baseId]++;

  // For first item of a kind, prefer not to add numeric suffix
  if (counters[baseId] === 1) {
    return baseId;
  }

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

    // Handle different types of JSX elements (normal and namespaced)
    let componentName;
    let isNamespaced = false;

    if (t.isJSXIdentifier(node.name)) {
      // Normal JSX element like <div> or <Box>
      componentName = node.name.name;
    } else if (t.isJSXMemberExpression(node.name)) {
      // Namespaced element like <Namespace.Element>
      componentName = node.name.property.name;
      isNamespaced = true;
    } else {
      // Skip other element types
      return;
    }

    // Determine if this is a Chakra component or HTML element we want to process
    const isChakraComponent = chakraComponents.has(componentName);
    const isHtmlElement = htmlElements.has(componentName.toLowerCase());

    // Skip processing based on options
    if ((options.htmlOnly && !isChakraComponent) ||
        (options.chakraOnly && !isHtmlElement) ||
        (!isChakraComponent && !isHtmlElement && !options.includeHtml) ||
        isNamespaced) { // Skip namespaced elements for now
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

    // Get parent JSX element for context
    const parentPath = path.findParent(p => p.isJSXElement());

    // Generate a unique test ID
    const testId = generateTestId(componentName, node.attributes, parentPath);

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
  .map(id => counters[id] === 1 ? id : `${id}-1`)
  .slice(0, 10);

examples.forEach((id, i) => {
  console.log(`  ${i+1}. ${id}`);
});

if (Object.keys(counters).length > 10) {
  console.log(`  ... and ${Object.keys(counters).length - 10} more`);
}