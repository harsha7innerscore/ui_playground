#!/usr/bin/env node

/**
 * add_chakra_testids_v4.js
 *
 * Enhanced script to automatically add meaningful data-testid attributes to both Chakra UI
 * elements and standard HTML5 elements in a JSX file.
 *
 * New features in v4:
 * 1. USER-SPECIFIED PREFIX for all test IDs (e.g., "task-page-") - the script will ALWAYS
 *    prompt for a prefix at the beginning of execution
 * 2. Improved test ID naming using class names and contextual information
 * 3. Better handling of nested elements and component context
 * 4. More intelligent fallbacks when ideal naming sources aren't available
 * 5. Enhanced comment extraction for semantic naming
 *
 * Usage: node add_chakra_testids_v4.js <input-file.jsx> [options]
 * Options:
 *   --include-html: Add data-testid to standard HTML elements (default: true)
 *   --html-only: Only process HTML elements, ignore Chakra components
 *   --chakra-only: Only process Chakra components, ignore HTML elements
 *   --comment-based: Use nearby comments for naming (default: true)
 *   --text-based: Use text content for naming (default: true)
 *   --verbose: Show detailed information about each test ID generated
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const readline = require('readline');

// Check for input file
const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Please provide an input file: node add_chakra_testids_v4.js <input-file.jsx> [options]');
  process.exit(1);
}

// Process options
const options = {
  includeHtml: true,      // Default to including HTML elements
  htmlOnly: false,
  chakraOnly: false,
  commentBased: true,     // Use comments for naming
  textBased: true,        // Use text content for naming
  verbose: false,         // Detailed output
  prefix: '',            // Will be set by user input
};

// Process command line arguments
for (let i = 1; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--include-html') options.includeHtml = true;
  else if (arg === '--html-only') {
    options.htmlOnly = true;
    options.chakraOnly = false;
  }
  else if (arg === '--chakra-only') {
    options.chakraOnly = true;
    options.htmlOnly = false;
    options.includeHtml = false;
  }
  else if (arg === '--no-comment-based') options.commentBased = false;
  else if (arg === '--no-text-based') options.textBased = false;
  else if (arg === '--verbose') options.verbose = true;
  // --prefix option removed, always prompt user for prefix
}

// Always prompt the user for a prefix
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a prefix for test IDs (e.g., "task-page" or "user-profile"): ', (answer) => {
  options.prefix = answer.trim();
  rl.close();
  processFile();
});

function processFile() {
  // Format the prefix to ensure proper formatting (kebab-case with trailing dash if not empty)
  if (options.prefix) {
    // Ensure the prefix is in kebab-case
    options.prefix = options.prefix
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/-$/g, '');

    // Add trailing dash if not present
    if (!options.prefix.endsWith('-')) {
      options.prefix += '-';
    }

    console.log(`Using user-specified prefix: "${options.prefix}" for all test IDs`);
  } else {
    console.log('No prefix specified, proceeding without a prefix');
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
  const customComponentRegex = /import\s+(\w+(?:Tool|Modal|Tooltip|Container|Button|Box|Card|Element|Header|Footer|Nav|Sidebar|Panel|List|Item|Icon|Badge|Tag|Tab|Section|Form|Input|Select|TextArea|Checkbox|Radio|Toggle|Slider|Switch|Menu|Dropdown|Dialog|Popover|Card|Avatar|Image|Video|Audio|Player|Wrapper))\s+from/g;
  while ((match = customComponentRegex.exec(fileContent)) !== null) {
    const componentName = match[1];
    if (!chakraComponents.has(componentName)) {
      chakraComponents.add(componentName);
    }
  }

  // Extract custom component from imported files with similar file names
  const customComponentFileRegex = /import\s+(\w+)\s+from\s+["'].*\/([^/]+)\/\2["']/g;
  while ((match = customComponentFileRegex.exec(fileContent)) !== null) {
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
    const defaultComponents = ['Box', 'Flex', 'VStack', 'HStack', 'Image', 'Text', 'Button', 'Container', 'Input', 'Heading', 'Grid', 'GridItem'];
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
  // Map to store component hierarchy for context
  const hierarchyMap = new Map();
  // Map to store class names for components
  const classNameMap = new Map();

  // First pass to gather context information
  if (options.commentBased) {
    traverse(ast, {
      enter(path) {
        // Collect leading comments
        const comments = path.node.leadingComments || [];
        if (comments.length > 0) {
          // Extract comment text
          const commentText = comments.map(comment => comment.value.trim()).join(' ');
          commentMap.set(path.node, commentText);
        }

        // If this is a JSX element, record its className
        if (path.isJSXElement()) {
          const openingElement = path.node.openingElement;
          if (openingElement && openingElement.attributes) {
            const classNameAttr = openingElement.attributes.find(
              attr => t.isJSXAttribute(attr) && attr.name.name === 'className'
            );

            if (classNameAttr) {
              let className = '';
              if (t.isStringLiteral(classNameAttr.value)) {
                className = classNameAttr.value.value;
              } else if (t.isJSXExpressionContainer(classNameAttr.value) &&
                       classNameAttr.value.expression &&
                       t.isMemberExpression(classNameAttr.value.expression)) {
                try {
                  className = classNameAttr.value.expression.property.name;
                } catch (e) {
                  // Unable to extract
                }
              }
              if (className) {
                classNameMap.set(path.node, className);
              }
            }
          }

          // Record element hierarchy
          const parentPath = path.findParent(p => p.isJSXElement());
          if (parentPath) {
            hierarchyMap.set(path.node, parentPath.node);
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

  // Helper to get the semantic context of an element
  function getElementContext(node) {
    // Check component hierarchy
    const parent = hierarchyMap.get(node);
    let parentContext = '';

    if (parent) {
      // Try to get the component name
      if (parent.openingElement && parent.openingElement.name) {
        const componentName = parent.openingElement.name.name;
        if (componentName) {
          parentContext = componentName.toLowerCase();

          // Get more context from parent's className
          const parentClassName = classNameMap.get(parent);
          if (parentClassName) {
            // Extract semantic words from className
            const semanticWords = parentClassName
              .split(/[^a-zA-Z0-9]+/)
              .filter(word =>
                word.length > 2 &&
                !['the', 'and', 'for', 'with'].includes(word.toLowerCase())
              );

            if (semanticWords.length > 0) {
              parentContext += '-' + semanticWords.join('-').toLowerCase();
            }
          }
        }
      }
    }

    return parentContext;
  }

  // Helper to extract semantic meaning from comments
  function getCommentContext(node) {
    // Check for comments on this node
    const commentText = commentMap.get(node) || '';
    if (!commentText) return '';

    // Look for descriptive patterns in comments
    // Patterns like: "User profile", "Navigation menu", "Search form", etc.
    const semanticPatterns = [
      /\b(header|footer|navigation|nav|sidebar|main|content|user|profile|search|form|input|button|list|item|container|wrapper|section|panel|card|modal|dialog|popover|tooltip|menu|dropdown)\b/i,
      /\b(\w+)\s+(section|area|region|component|element|container|wrapper|view|panel|group)\b/i,
    ];

    for (const pattern of semanticPatterns) {
      const match = commentText.match(pattern);
      if (match) {
        return match[0].toLowerCase().replace(/\s+/g, '-');
      }
    }

    // Extract first few meaningful words if no pattern matches
    const words = commentText
      .split(/\s+/)
      .filter(word =>
        word.length > 2 &&
        !/^[0-9.]+$/.test(word) &&
        !['the', 'and', 'for', 'with', 'this', 'that'].includes(word.toLowerCase())
      )
      .slice(0, 3); // Take up to 3 words

    if (words.length > 0) {
      return words.join('-').toLowerCase().replace(/[^\w-]+/g, '');
    }

    return '';
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

  // Helper to extract all classes from a className string
  function getClassesFromClassName(className) {
    if (!className) return [];

    // Split by spaces and filter out empty strings
    return className.split(/\s+/).filter(Boolean);
  }

  // Helper to find most meaningful class name
  function getMeaningfulClassName(classNames) {
    if (!classNames || classNames.length === 0) return '';

    // Filter out utility classes (common in frameworks like Tailwind, Bootstrap)
    const utilityPatterns = [
      /^(mt|mb|ml|mr|pt|pb|pl|pr|m|p|w|h)-[0-9]+$/,  // Margin, padding, width, height
      /^(flex|grid|block|inline|hidden)$/,           // Display
      /^(text|bg|border)-[a-z]+-[0-9]+$/,            // Colors with scales
      /^(text|font)-(xs|sm|md|lg|xl|[0-9]+)$/,        // Text sizes
      /^(rounded|shadow|opacity|scale|rotate)-/,     // Various utilities
    ];

    // Try to find a semantic class name (not a utility class)
    const semanticClasses = classNames.filter(className => {
      return !utilityPatterns.some(pattern => pattern.test(className));
    });

    if (semanticClasses.length > 0) {
      return semanticClasses[0]; // Return the first semantic class
    }

    // If no semantic classes, return the first class
    return classNames[0] || '';
  }

  // Function to generate a unique test ID for a component
  function generateTestId(componentName, attributes, parentPath) {
    // Convert component name to lowercase
    const lowerName = componentName.toLowerCase();

    // Initialize test ID parts
    let idParts = [];
    let suffix = '';
    let attributeFound = false;

    // 1. First priority: Look for existing semantic identifiers

    // a) Check for role attribute (for accessibility)
    const roleAttr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'role'
    );

    if (roleAttr && t.isStringLiteral(roleAttr.value)) {
      suffix = `${roleAttr.value.value}`;
      attributeFound = true;
      if (options.verbose) console.log(`Using role attribute: ${suffix}`);
    }

    // b) Look for aria-label (great for accessibility and descriptive names)
    if (!attributeFound) {
      const ariaLabelAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'aria-label'
      );

      if (ariaLabelAttr && t.isStringLiteral(ariaLabelAttr.value)) {
        suffix = sanitizeForTestId(ariaLabelAttr.value.value);
        attributeFound = true;
        if (options.verbose) console.log(`Using aria-label: ${suffix}`);
      }
    }

    // c) Look for title (also great for descriptive names)
    if (!attributeFound) {
      const titleAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'title'
      );

      if (titleAttr && t.isStringLiteral(titleAttr.value)) {
        suffix = sanitizeForTestId(titleAttr.value.value);
        attributeFound = true;
        if (options.verbose) console.log(`Using title attribute: ${suffix}`);
      }
    }

    // 2. Second priority: Check for className (major improvement in v4)
    if (!attributeFound) {
      const classNameAttr = attributes.find(
        attr => t.isJSXAttribute(attr) && attr.name.name === 'className'
      );

      if (classNameAttr) {
        let classNames = [];

        if (t.isJSXExpressionContainer(classNameAttr.value) &&
            t.isMemberExpression(classNameAttr.value.expression)) {
          try {
            // Handle Styles.className or Styles?.className
            const propertyName = classNameAttr.value.expression.property.name;
            if (propertyName) {
              classNames.push(propertyName);
              attributeFound = true;
              if (options.verbose) console.log(`Using className from styles object: ${propertyName}`);
            }
          } catch (e) {
            // Handle any errors in property access
          }
        } else if (t.isStringLiteral(classNameAttr.value)) {
          // Handle className="some-class other-class"
          classNames = getClassesFromClassName(classNameAttr.value.value);
          if (classNames.length > 0) {
            attributeFound = true;
            if (options.verbose) console.log(`Using classNames: ${classNames.join(', ')}`);
          }
        }

        if (classNames.length > 0) {
          const meaningfulClass = getMeaningfulClassName(classNames);
          if (meaningfulClass) {
            suffix = meaningfulClass.replace(/[^\w-]/g, '-');
          }
        }
      }
    }

    // 3. Check for semantic props for Chakra components
    if (!attributeFound) {
      // Check for common props like 'label', 'placeholder', etc.
      ['label', 'placeholder', 'heading', 'caption', 'variant', 'size', 'name', 'type', 'id'].forEach(propName => {
        if (attributeFound) return;

        const propAttr = attributes.find(
          attr => t.isJSXAttribute(attr) && attr.name.name === propName
        );

        if (propAttr) {
          if (t.isStringLiteral(propAttr.value)) {
            suffix = sanitizeForTestId(propAttr.value.value);
            attributeFound = true;
            if (options.verbose) console.log(`Using ${propName} attribute: ${suffix}`);
          } else if (t.isJSXExpressionContainer(propAttr.value) &&
                   t.isStringLiteral(propAttr.value.expression)) {
            suffix = sanitizeForTestId(propAttr.value.expression.value);
            attributeFound = true;
            if (options.verbose) console.log(`Using ${propName} expression: ${suffix}`);
          }
        }
      });
    }

    // 4. For buttons, links and clickable elements, look for onClick handlers
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

            suffix = `${actionName}`;
            if (lowerName === 'button' && !actionName.endsWith('btn') && !actionName.endsWith('button')) {
              suffix += '-btn';
            }
            attributeFound = true;
            if (options.verbose) console.log(`Using onClick handler: ${suffix}`);
          }
        } catch (e) {
          // Handle errors in expression extraction
        }
      }
    }

    // 5. For Image components, use src context
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
              if (options.verbose) console.log(`Using image src identifier: ${suffix}`);
            } else if (t.isMemberExpression(srcAttr.value.expression)) {
              suffix = srcAttr.value.expression.property.name;
              attributeFound = true;
              if (options.verbose) console.log(`Using image src property: ${suffix}`);
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
          if (options.verbose) console.log(`Using image src filename: ${suffix}`);
        }
      }
    }

    // 6. Use text content if available and option is enabled
    if (options.textBased && !attributeFound && parentPath) {
      const jsxElement = parentPath.node;
      const textContent = getTextFromJSXElement(jsxElement);

      if (textContent) {
        // Limit text length and sanitize
        suffix = sanitizeForTestId(textContent);
        attributeFound = true;
        if (options.verbose) console.log(`Using text content: ${suffix}`);
      }
    }

    // 7. Check for comments if option is enabled
    if (options.commentBased && !attributeFound && parentPath) {
      const jsxElement = parentPath.node;
      const commentContext = getCommentContext(jsxElement);

      if (commentContext) {
        suffix = commentContext;
        attributeFound = true;
        if (options.verbose) console.log(`Using comment context: ${suffix}`);
      }
    }

    // 8. Use element context from hierarchy
    if (!attributeFound && parentPath) {
      const jsxElement = parentPath.node;
      const elementContext = getElementContext(jsxElement);

      if (elementContext) {
        suffix = elementContext;
        attributeFound = true;
        if (options.verbose) console.log(`Using element context: ${suffix}`);
      }
    }

    // Create the base test ID with improved semantics
    let baseId;
    if (attributeFound && suffix) {
      // If suffix already contains component type, don't duplicate it
      if (suffix.includes(lowerName) ||
          (lowerName === 'button' && suffix.endsWith('btn'))) {
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

    // Apply user-provided prefix
    const prefixedId = options.prefix ? options.prefix + baseId : baseId;

    // Ensure uniqueness
    if (!counters[prefixedId]) {
      counters[prefixedId] = 0;
    }

    counters[prefixedId]++;

    // For first item of a kind, prefer not to add numeric suffix
    if (counters[prefixedId] === 1) {
      return prefixedId;
    }

    return `${prefixedId}-${counters[prefixedId]}`;
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
      if ((options.htmlOnly && !isHtmlElement) ||
          (options.chakraOnly && !isChakraComponent) ||
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
}