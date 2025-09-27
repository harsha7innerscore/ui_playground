#!/usr/bin/env node

/**
 * add_chakra_testids_v7.js
 *
 * Enhanced script to automatically add meaningful data-testid attributes to both Chakra UI
 * elements and standard HTML5 elements in a JSX file.
 *
 * New features in v7:
 * 1. Semantic naming patterns with improved structure/hierarchy awareness
 * 2. Intelligent component relationship detection
 * 3. Enhanced support for dynamic patterns with improved variable handling
 * 4. More flexible component detection with framework-agnostic patterns
 * 5. Advanced caching of generated IDs to maintain consistency across files
 * 6. Better performance for large files with optimized traversal
 * 7. Enhanced role-based naming for accessibility and semantics
 * 8. Smarter handling of semantic markup with consistent patterns
 * 9. All v6 features including improved key preservation and dynamic IDs
 *
 * Usage: node add_chakra_testids_v7.js <input-file.jsx> [options]
 * Options:
 *   --include-html: Add data-testid to standard HTML elements (default: true)
 *   --html-only: Only process HTML elements, ignore Chakra components
 *   --chakra-only: Only process Chakra components, ignore HTML elements
 *   --comment-based: Use nearby comments for naming (default: true)
 *   --text-based: Use text content for naming (default: true)
 *   --verbose: Show detailed information about each test ID generated
 *   --output-dir: Specify an output directory (default: same as input file)
 *   --batch: Process all JSX files in a directory
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
  console.error('Please provide an input file: node add_chakra_testids_v7.js <input-file.jsx> [options]');
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
  prefix: '',             // Will be set by user input
  outputDir: '',          // Output directory (default: same as input)
  batch: false,           // Process all JSX files in a directory
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
  else if (arg === '--batch') options.batch = true;
  else if (arg === '--output-dir' && i + 1 < args.length) {
    options.outputDir = args[i + 1];
    i++;
  }
}

// Always prompt the user for a prefix
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a prefix for test IDs (e.g., "task-page" or "user-profile"): ', (answer) => {
  options.prefix = answer.trim();
  rl.close();

  if (options.batch) {
    processBatch();
  } else {
    processFile();
  }
});

/**
 * Process all JSX files in a directory
 */
function processBatch() {
  // Get the full path to the input directory
  const inputDirPath = path.resolve(process.cwd(), inputFile);

  // Verify it's a directory
  if (!fs.statSync(inputDirPath).isDirectory()) {
    console.error(`Error: ${inputDirPath} is not a directory. Use --batch with a directory path.`);
    process.exit(1);
  }

  // Get all JSX files in the directory
  const files = fs.readdirSync(inputDirPath).filter(file =>
    file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js')
  );

  console.log(`Found ${files.length} JSX/TSX/JS files to process.`);

  // Create output directory if it doesn't exist
  const outputDirPath = options.outputDir ?
    path.resolve(process.cwd(), options.outputDir) :
    path.join(inputDirPath, 'with_testids');

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  // Process each file
  let successes = 0;
  let failures = 0;

  files.forEach(file => {
    const inputFilePath = path.join(inputDirPath, file);
    const outputFilePath = path.join(outputDirPath, file);

    try {
      processFileWithPaths(inputFilePath, outputFilePath);
      successes++;
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      failures++;
    }
  });

  console.log(`\nBatch processing complete: ${successes} files succeeded, ${failures} files failed.`);
}

/**
 * Process a single file
 */
function processFile() {
  // Format the prefix to ensure proper formatting (kebab-case with trailing dash if not empty)
  formatPrefix();

  // Get the full path to the input file
  const inputFilePath = path.resolve(process.cwd(), inputFile);

  // Output file path
  const fileExt = path.extname(inputFilePath);
  const fileName = path.basename(inputFilePath, fileExt);
  let outputDir = path.dirname(inputFilePath);

  if (options.outputDir) {
    outputDir = path.resolve(process.cwd(), options.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  const outputFilePath = path.join(outputDir, `${fileName}_with_testids${fileExt}`);

  processFileWithPaths(inputFilePath, outputFilePath);
}

/**
 * Process a file with given input and output paths
 */
function processFileWithPaths(inputFilePath, outputFilePath) {
  // Read the input file
  let fileContent;
  try {
    fileContent = fs.readFileSync(inputFilePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    if (options.batch) {
      throw error; // Re-throw to be caught by batch processing
    } else {
      process.exit(1);
    }
  }

  // Format the prefix (if not already done in batch mode)
  if (!options.prefix.endsWith('-') && options.prefix) {
    formatPrefix();
  }

  // Find UI component imports (enhanced to detect more frameworks)
  const frameworks = detectUIFrameworks(fileContent);

  // Extract Chakra and custom component names
  const { chakraComponents, customComponents } = extractComponentNames(fileContent, frameworks);

  // Print detected components
  if (!options.batch || options.verbose) {
    console.log('Detected Chakra UI components:', Array.from(chakraComponents).join(', '));
    if (customComponents.size > 0) {
      console.log('Detected custom components:', Array.from(customComponents).join(', '));
    }
  }

  // If no components were found and we're not in HTML-only mode, use common Chakra components as fallback
  if (chakraComponents.size === 0 && !options.htmlOnly) {
    console.log('No Chakra UI imports found. Using default components list.');
    const defaultComponents = ['Box', 'Flex', 'VStack', 'HStack', 'Image', 'Text', 'Button', 'Container', 'Input', 'Heading', 'Grid', 'GridItem'];
    defaultComponents.forEach(comp => chakraComponents.add(comp));
  }

  // Common HTML elements to add testIds to (enhanced with more semantic elements)
  const htmlElements = getHtmlElements();

  if (!options.batch || options.verbose) {
    console.log('HTML elements that will receive test IDs:', Array.from(htmlElements).join(', '));
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
    if (options.batch) {
      throw error; // Re-throw to be caught by batch processing
    } else {
      process.exit(1);
    }
  }

  // Initialize maps and trackers
  const {
    counters,
    testIdCache,
    commentMap,
    hierarchyMap,
    classNameMap,
    loopMap,
    keyPropMap,
    keyExpressionMap,
    idPropMap,
    wrapperChildMap,
    roleMap,
    semanticGroupMap,
    interactiveElementMap,
    componentContextMap
  } = initializeDataStructures();

  // First pass to gather context information and detect loops
  gatherComponentContext(ast, commentMap, hierarchyMap, classNameMap, loopMap, keyPropMap, keyExpressionMap, idPropMap, wrapperChildMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap);

  // Process the AST and add data-testid attributes
  const { addedCount, componentTypesCount } = addTestIds(ast, chakraComponents, customComponents, htmlElements, options, counters, testIdCache, commentMap, hierarchyMap, classNameMap, loopMap, keyPropMap, keyExpressionMap, idPropMap, wrapperChildMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap);

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
    if (!options.batch || options.verbose) {
      console.log(`✅ Added ${addedCount} data-testid attributes`);
      console.log(`✅ Output written to: ${outputFilePath}`);

      // Print component types summary
      console.log('\nSummary of component types:');
      if (componentTypesCount.chakra > 0) {
        console.log(`  Chakra UI components: ${componentTypesCount.chakra}`);
      }
      if (componentTypesCount.custom > 0) {
        console.log(`  Custom components: ${componentTypesCount.custom}`);
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
    } else {
      console.log(`✅ Processed ${path.basename(inputFilePath)} -> ${path.basename(outputFilePath)}`);
    }
  } catch (error) {
    console.error(`Error writing output: ${error.message}`);
    if (options.batch) {
      throw error;
    } else {
      process.exit(1);
    }
  }
}

/**
 * Format the prefix to ensure proper formatting
 */
function formatPrefix() {
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
}

/**
 * Get the set of HTML elements to process
 */
function getHtmlElements() {
  return new Set([
    // Structure elements
    'div', 'span', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav',

    // Form elements
    'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
    'fieldset', 'legend', 'datalist', 'output', 'progress', 'meter',

    // Table elements
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',

    // Media elements
    'img', 'video', 'audio', 'source', 'track', 'figure', 'figcaption',
    'canvas', 'picture', 'svg', 'map', 'area',

    // Interactive elements
    'a', 'dialog', 'details', 'summary', 'menu', 'menuitem',

    // Text formatting
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'blockquote', 'q', 'cite', 'pre', 'code', 'kbd', 'samp', 'var', 'mark',
    'bdi', 'bdo', 'ruby', 'rt', 'rp', 'abbr', 'address',

    // Semantic elements
    'time', 'data', 'slot', 'template', 'wbr', 'embed',
    'object', 'param', 'iframe', 'noscript', 'hr'
  ]);
}

/**
 * Initialize all data structures needed for processing
 */
function initializeDataStructures() {
  return {
    counters: {},  // Counters to generate unique test IDs
    testIdCache: new Map(), // Cache of generated IDs to maintain consistency
    commentMap: new Map(), // Map to store leading comments for nodes
    hierarchyMap: new Map(), // Map to store component hierarchy for context
    classNameMap: new Map(), // Map to store class names for components
    loopMap: new Map(), // Map to store loop info for components
    keyPropMap: new Map(), // Map to store key props for components
    keyExpressionMap: new Map(), // Map to store raw key expression for components
    idPropMap: new Map(), // Map to store id props for components
    wrapperChildMap: new Map(), // Map to store wrapper-child relationships
    roleMap: new Map(), // NEW: Map to store ARIA roles for components
    semanticGroupMap: new Map(), // NEW: Map to store semantic grouping for components
    interactiveElementMap: new Map(), // NEW: Map to identify interactive elements
    componentContextMap: new Map() // NEW: Map to store rich context for each component
  };
}

/**
 * Detect UI frameworks used in the file
 */
function detectUIFrameworks(fileContent) {
  const frameworks = {
    chakraUI: false,
    materialUI: false,
    antDesign: false,
    styledComponents: false,
    tailwindCSS: false,
    bootstrap: false,
    emotion: false
  };

  // Check for Chakra UI
  if (fileContent.includes('@chakra-ui/')) {
    frameworks.chakraUI = true;
  }

  // Check for Material UI
  if (fileContent.includes('@mui/') || fileContent.includes('@material-ui/')) {
    frameworks.materialUI = true;
  }

  // Check for Ant Design
  if (fileContent.includes('antd') || fileContent.includes('@ant-design/')) {
    frameworks.antDesign = true;
  }

  // Check for styled-components
  if (fileContent.includes('styled-components')) {
    frameworks.styledComponents = true;
  }

  // Check for Tailwind CSS
  if (fileContent.includes('tailwind') || /className=["'].*?[^-](?:flex|grid|text-\w+)/.test(fileContent)) {
    frameworks.tailwindCSS = true;
  }

  // Check for Bootstrap
  if (fileContent.includes('react-bootstrap') || fileContent.includes('bootstrap')) {
    frameworks.bootstrap = true;
  }

  // Check for Emotion
  if (fileContent.includes('@emotion/') || fileContent.includes('css`')) {
    frameworks.emotion = true;
  }

  return frameworks;
}

/**
 * Extract component names from imports
 */
function extractComponentNames(fileContent, frameworks) {
  const chakraComponents = new Set();
  const customComponents = new Set();

  const importRegex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/g;
  const singleImportRegex = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g;
  const chakraImportRegex = /@chakra-ui\/\w+|@chakra-ui/g;
  const materialUIRegex = /@mui\/\w+|@material-ui/g;
  const antDesignRegex = /antd|@ant-design/g;

  // Handle named imports for various frameworks
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    const imports = match[1].split(',').map(s => s.trim());
    const packageName = match[2];

    // Check for Chakra UI
    if (packageName.match(chakraImportRegex)) {
      imports.forEach(importName => {
        // Handle 'as' imports: Button as ChakraButton
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        chakraComponents.add(finalName);
      });
    }
    // Check for Material UI
    else if (frameworks.materialUI && packageName.match(materialUIRegex)) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        customComponents.add(finalName);
      });
    }
    // Check for Ant Design
    else if (frameworks.antDesign && packageName.match(antDesignRegex)) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        customComponents.add(finalName);
      });
    }
    // Check other imports for component-like names
    else if (imports.some(imp => isLikelyComponent(imp.split(' as ').pop().trim()))) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        if (isLikelyComponent(finalName)) {
          customComponents.add(finalName);
        }
      });
    }
  }

  // Handle default imports
  while ((match = singleImportRegex.exec(fileContent)) !== null) {
    const componentName = match[1];
    const packageName = match[2];

    if (packageName.match(chakraImportRegex)) {
      chakraComponents.add(componentName);
    } else if (frameworks.materialUI && packageName.match(materialUIRegex)) {
      customComponents.add(componentName);
    } else if (frameworks.antDesign && packageName.match(antDesignRegex)) {
      customComponents.add(componentName);
    } else if (isLikelyComponent(componentName)) {
      customComponents.add(componentName);
    }
  }

  // Also look for custom components that might be UI-based
  const customComponentRegex = /import\s+(\w+(?:Tool|Modal|Tooltip|Container|Button|Box|Card|Element|Header|Footer|Nav|Sidebar|Panel|List|Item|Icon|Badge|Tag|Tab|Section|Form|Input|Select|TextArea|Checkbox|Radio|Toggle|Slider|Switch|Menu|Dropdown|Dialog|Popover|Card|Avatar|Image|Video|Audio|Player|Wrapper))\s+from/g;
  while ((match = customComponentRegex.exec(fileContent)) !== null) {
    const componentName = match[1];
    if (!chakraComponents.has(componentName) && !customComponents.has(componentName)) {
      customComponents.add(componentName);
    }
  }

  // Extract custom components from imported files with similar file names
  const customComponentFileRegex = /import\s+(\w+)\s+from\s+["'].*\/([^/]+)\/\2["']/g;
  while ((match = customComponentFileRegex.exec(fileContent)) !== null) {
    const componentName = match[1];
    if (!chakraComponents.has(componentName) && !customComponents.has(componentName) && isLikelyComponent(componentName)) {
      customComponents.add(componentName);
    }
  }

  // Extract styled components
  if (frameworks.styledComponents || frameworks.emotion) {
    const styledComponentRegex = /(?:styled|css|sx)\s*\.\s*(\w+)|const\s+(\w+)\s*=\s*styled/g;
    while ((match = styledComponentRegex.exec(fileContent)) !== null) {
      const componentName = match[1] || match[2];
      if (componentName && !chakraComponents.has(componentName) && !customComponents.has(componentName) && isLikelyComponent(componentName)) {
        customComponents.add(componentName);
      }
    }
  }

  return { chakraComponents, customComponents };
}

/**
 * Check if a name is likely a component name
 */
function isLikelyComponent(name) {
  // Check if name starts with uppercase letter (React component naming convention)
  if (!name || typeof name !== 'string') return false;

  if (name[0] !== name[0].toUpperCase()) return false;

  // Check for common component name patterns
  const componentPatterns = [
    /Button$/, /Card$/, /Container$/, /Dialog$/, /Dropdown$/,
    /Form$/, /Grid$/, /Header$/, /Icon$/, /Input$/, /Item$/,
    /List$/, /Menu$/, /Modal$/, /Nav$/, /Panel$/, /Popover$/,
    /Section$/, /Select$/, /Sidebar$/, /Table$/, /Tabs$/,
    /Text$/, /Tooltip$/, /View$/, /Wrapper$/
  ];

  return componentPatterns.some(pattern => pattern.test(name));
}

/**
 * First pass to gather component context information
 */
function gatherComponentContext(ast, commentMap, hierarchyMap, classNameMap, loopMap, keyPropMap, keyExpressionMap, idPropMap, wrapperChildMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap) {
  traverse(ast, {
    enter(path) {
      // Collect leading comments
      const comments = path.node.leadingComments || [];
      if (comments.length > 0) {
        // Extract comment text
        const commentText = comments.map(comment => comment.value.trim()).join(' ');
        commentMap.set(path.node, commentText);
      }

      // Track loops and mapping components
      if (path.isCallExpression() &&
         (path.get('callee').isMemberExpression() || path.get('callee').isIdentifier()) &&
         ((path.node.callee.name === 'map') ||
          (path.node.callee.property && path.node.callee.property.name === 'map'))) {
        // Store information about the loop context
        const loopPath = path.findParent(p => p.isJSXElement() || p.isJSXExpressionContainer());
        if (loopPath) {
          // Get array being mapped, if possible
          let arrayName = '';
          try {
            if (path.node.callee.object && path.node.callee.object.name) {
              arrayName = path.node.callee.object.name;
            } else if (path.node.callee.object && path.node.callee.object.property) {
              arrayName = path.node.callee.object.property.name;
            }
          } catch (e) {
            // Unable to extract
          }

          loopMap.set(loopPath.node, {
            isLoop: true,
            loopVarName: path.node.arguments[0] &&
                         path.node.arguments[0].params &&
                         path.node.arguments[0].params[0] ?
                         path.node.arguments[0].params[0].name : 'item',
            arrayName
          });
        }
      }

      // If this is a JSX element, record various attributes and relationships
      if (path.isJSXElement()) {
        extractElementAttributes(path, classNameMap, keyPropMap, keyExpressionMap, idPropMap, roleMap);
        recordElementRelationships(path, hierarchyMap, wrapperChildMap, semanticGroupMap);
        identifyInteractiveElements(path, interactiveElementMap);
      }
    }
  });

  // Second pass to build component context based on gathered information
  traverse(ast, {
    JSXElement(path) {
      buildComponentContext(path, hierarchyMap, classNameMap, commentMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap);
    }
  });
}

/**
 * Extract various attributes from a JSX element
 */
function extractElementAttributes(path, classNameMap, keyPropMap, keyExpressionMap, idPropMap, roleMap) {
  const openingElement = path.node.openingElement;
  if (openingElement && openingElement.attributes) {
    // Extract className
    extractClassName(path.node, openingElement.attributes, classNameMap);

    // Extract key prop
    extractKeyProp(path.node, openingElement.attributes, keyPropMap, keyExpressionMap);

    // Extract id prop
    extractIdProp(path.node, openingElement.attributes, idPropMap);

    // NEW: Extract ARIA role
    extractRole(path.node, openingElement.attributes, roleMap);
  }
}

/**
 * Extract className attribute from element
 */
function extractClassName(node, attributes, classNameMap) {
  const classNameAttr = attributes.find(
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
      classNameMap.set(node, className);
    }
  }
}

/**
 * Extract key prop from element
 */
function extractKeyProp(node, attributes, keyPropMap, keyExpressionMap) {
  const keyAttr = attributes.find(
    attr => t.isJSXAttribute(attr) && attr.name.name === 'key'
  );

  if (keyAttr) {
    let keyValue = '';
    // Store the raw expression for potential direct use
    if (t.isJSXExpressionContainer(keyAttr.value)) {
      keyExpressionMap.set(node, keyAttr.value.expression);
    }

    if (t.isStringLiteral(keyAttr.value)) {
      keyValue = keyAttr.value.value;
    } else if (t.isJSXExpressionContainer(keyAttr.value)) {
      const expr = keyAttr.value.expression;
      keyValue = extractExpressionValue(expr);
    }

    if (keyValue) {
      keyPropMap.set(node, keyValue);
    }
  }
}

/**
 * Helper to extract value from various expression types
 */
function extractExpressionValue(expr) {
  if (!expr) return '';

  if (t.isIdentifier(expr)) {
    return expr.name;
  } else if (t.isStringLiteral(expr)) {
    return expr.value;
  } else if (t.isMemberExpression(expr)) {
    try {
      if (t.isIdentifier(expr.property)) {
        return expr.property.name;
      }
    } catch (e) {
      // Unable to extract
    }
  } else if (t.isBinaryExpression(expr)) {
    // Handle expressions like key={`${item.id}-suffix`}
    if (t.isStringLiteral(expr.right)) {
      return expr.right.value;
    }
  } else if (t.isTemplateLiteral(expr)) {
    try {
      // Extract the raw structure of the template literal
      const quasis = expr.quasis.map(q => q.value.raw);
      const expressions = expr.expressions.map((e, i) => {
        // Try to extract meaningful parts of expressions
        if (t.isIdentifier(e)) {
          return e.name;
        } else if (t.isMemberExpression(e)) {
          if (t.isIdentifier(e.property)) {
            return e.property.name;
          }
        }
        return `expr${i}`;
      });

      // Combine quasis and expressions to reconstruct the template
      let templateStructure = '';
      for (let i = 0; i < quasis.length; i++) {
        templateStructure += quasis[i];
        if (i < expressions.length) {
          templateStructure += `\${${expressions[i]}}`;
        }
      }

      return templateStructure;
    } catch (e) {
      // If we can't extract the structure, get the static parts
      try {
        const staticParts = expr.quasis.map(q => q.value.raw).join('');
        return staticParts;
      } catch (e2) {
        // Unable to extract
      }
    }
  }

  return '';
}

/**
 * Extract id prop from element
 */
function extractIdProp(node, attributes, idPropMap) {
  const idAttr = attributes.find(
    attr => t.isJSXAttribute(attr) && attr.name.name === 'id'
  );

  if (idAttr) {
    let idValue = '';
    if (t.isStringLiteral(idAttr.value)) {
      idValue = idAttr.value.value;
    } else if (t.isJSXExpressionContainer(idAttr.value) && t.isStringLiteral(idAttr.value.expression)) {
      idValue = idAttr.value.expression.value;
    }
    if (idValue) {
      idPropMap.set(node, idValue);
    }
  }
}

/**
 * Extract ARIA role from element
 */
function extractRole(node, attributes, roleMap) {
  const roleAttr = attributes.find(
    attr => t.isJSXAttribute(attr) && attr.name.name === 'role'
  );

  if (roleAttr) {
    let roleValue = '';
    if (t.isStringLiteral(roleAttr.value)) {
      roleValue = roleAttr.value.value;
    } else if (t.isJSXExpressionContainer(roleAttr.value) && t.isStringLiteral(roleAttr.value.expression)) {
      roleValue = roleAttr.value.expression.value;
    }
    if (roleValue) {
      roleMap.set(node, roleValue);
    }
  }
}

/**
 * Record element relationships (hierarchy, wrappers, semantic groups)
 */
function recordElementRelationships(path, hierarchyMap, wrapperChildMap, semanticGroupMap) {
  // Record element hierarchy
  const parentPath = path.findParent(p => p.isJSXElement());
  if (parentPath) {
    hierarchyMap.set(path.node, parentPath.node);

    // Store wrapper-child relationship
    try {
      let parentName = '';
      let childName = '';

      if (t.isJSXIdentifier(parentPath.node.openingElement.name)) {
        parentName = parentPath.node.openingElement.name.name;
      }

      if (t.isJSXIdentifier(path.node.openingElement.name)) {
        childName = path.node.openingElement.name.name;
      }

      if (parentName && childName) {
        wrapperChildMap.set(path.node, {
          wrapper: parentName,
          child: childName
        });
      }

      // Identify semantic groupings
      identifySemanticGroup(path, parentPath, semanticGroupMap);

    } catch (e) {
      // Failed to extract component names
    }
  }
}

/**
 * Identify semantic groups (e.g., form fields, navigation items, etc.)
 */
function identifySemanticGroup(path, parentPath, semanticGroupMap) {
  if (!path || !parentPath) return;

  try {
    const childElement = path.node.openingElement;
    const parentElement = parentPath.node.openingElement;

    if (!childElement || !parentElement) return;

    // Get element names
    let childName = '';
    let parentName = '';

    if (t.isJSXIdentifier(childElement.name)) {
      childName = childElement.name.name.toLowerCase();
    }

    if (t.isJSXIdentifier(parentElement.name)) {
      parentName = parentElement.name.name.toLowerCase();
    }

    if (!childName || !parentName) return;

    // Define semantic groups based on parent-child relationships
    const semanticGroups = {
      form: ['input', 'select', 'textarea', 'button', 'label', 'fieldset'],
      navigation: ['a', 'link', 'navlink', 'button'],
      list: ['li', 'listitem'],
      table: ['tr', 'th', 'td'],
      card: ['header', 'footer', 'body', 'image', 'title', 'subtitle'],
      dialog: ['header', 'footer', 'body', 'title', 'content'],
      tabs: ['tab', 'tabpanel']
    };

    // Check for known semantic groupings
    for (const [group, members] of Object.entries(semanticGroups)) {
      // If parent matches a group container and child is a member
      if ((parentName.includes(group) || getGroupFromRole(parentPath.node, roleMap)) === group) {
        if (members.some(member => childName.includes(member.toLowerCase()))) {
          semanticGroupMap.set(path.node, { group, role: 'item' });
        }
      }

      // If child is the container and parent is a grouping element
      if (childName.includes(group)) {
        semanticGroupMap.set(path.node, { group, role: 'container' });
      }
    }
  } catch (e) {
    // Error in semantic group identification
  }
}

/**
 * Get semantic group from ARIA role
 */
function getGroupFromRole(node, roleMap) {
  if (!roleMap.has(node)) return null;

  const role = roleMap.get(node);

  // Map ARIA roles to semantic groups
  const roleToGroup = {
    'navigation': 'navigation',
    'menu': 'navigation',
    'form': 'form',
    'list': 'list',
    'listbox': 'list',
    'grid': 'table',
    'row': 'table',
    'tablist': 'tabs',
    'tab': 'tabs',
    'dialog': 'dialog',
    'alertdialog': 'dialog'
  };

  return roleToGroup[role] || null;
}

/**
 * Identify interactive elements (buttons, links, etc.)
 */
function identifyInteractiveElements(path, interactiveElementMap) {
  const node = path.node;

  if (!node.openingElement) return;

  try {
    // Check element name
    let isInteractive = false;
    let interactionType = '';

    if (t.isJSXIdentifier(node.openingElement.name)) {
      const elementName = node.openingElement.name.name.toLowerCase();

      // Check for naturally interactive elements
      if (['button', 'a', 'input', 'select', 'textarea', 'label', 'details', 'dialog', 'summary'].includes(elementName)) {
        isInteractive = true;
        interactionType = elementName === 'a' ? 'link' : (
          elementName === 'button' ? 'button' : 'input'
        );
      }

      // Check for component names that suggest interactivity
      if (/button|link|clickable|toggle|switch|checkbox|radio|select|dropdown|menu|tab|input/i.test(elementName)) {
        isInteractive = true;

        if (/button|btn/i.test(elementName)) interactionType = 'button';
        else if (/link/i.test(elementName)) interactionType = 'link';
        else if (/input|field|text/i.test(elementName)) interactionType = 'input';
        else if (/select|dropdown|menu/i.test(elementName)) interactionType = 'select';
        else interactionType = 'interactive';
      }
    }

    // Check for event handlers that suggest interactivity
    const interactiveEventHandlers = ['onClick', 'onSubmit', 'onChange', 'onKeyDown', 'onKeyUp', 'onKeyPress', 'onFocus', 'onBlur'];

    for (const attr of node.openingElement.attributes) {
      if (t.isJSXAttribute(attr) && interactiveEventHandlers.includes(attr.name.name)) {
        isInteractive = true;

        // Determine the type of interaction based on the handler
        if (attr.name.name === 'onClick') {
          interactionType = interactionType || 'clickable';

          // Try to extract the handler name to get more context
          if (t.isJSXExpressionContainer(attr.value) && t.isIdentifier(attr.value.expression)) {
            const handlerName = attr.value.expression.name;
            if (handlerName.startsWith('handle') || handlerName.startsWith('on')) {
              const actionName = handlerName
                .replace(/^(handle|on)/, '')
                .replace(/^./, c => c.toLowerCase())
                .replace(/[A-Z]/g, c => '-' + c.toLowerCase());

              if (actionName) {
                interactionType = actionName;
              }
            }
          }
        } else if (attr.name.name === 'onChange') {
          interactionType = interactionType || 'input';
        } else if (attr.name.name === 'onSubmit') {
          interactionType = 'submit';
        }

        break;
      }
    }

    if (isInteractive) {
      interactiveElementMap.set(node, { isInteractive, interactionType });
    }
  } catch (e) {
    // Error identifying interactive element
  }
}

/**
 * Build rich component context by combining gathered information
 */
function buildComponentContext(path, hierarchyMap, classNameMap, commentMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap) {
  const node = path.node;

  try {
    if (!node.openingElement) return;

    // Get component name
    let componentName = '';
    if (t.isJSXIdentifier(node.openingElement.name)) {
      componentName = node.openingElement.name.name;
    } else if (t.isJSXMemberExpression(node.openingElement.name)) {
      componentName = node.openingElement.name.property.name;
    } else {
      return;
    }

    // Build context object
    const context = {
      name: componentName,
      role: roleMap.get(node) || '',
      className: classNameMap.get(node) || '',
      comments: commentMap.get(node) || '',
      semanticGroup: semanticGroupMap.get(node) || null,
      interactive: interactiveElementMap.get(node) || null,
      text: getTextFromJSXElement(node) || '',
      parentName: '',
      nestingLevel: 0,
      siblingPosition: 0
    };

    // Add parent information
    const parent = hierarchyMap.get(node);
    if (parent && parent.openingElement) {
      if (t.isJSXIdentifier(parent.openingElement.name)) {
        context.parentName = parent.openingElement.name.name;
      } else if (t.isJSXMemberExpression(parent.openingElement.name)) {
        context.parentName = parent.openingElement.name.property.name;
      }

      // Calculate nesting level
      let current = node;
      let level = 0;
      while (hierarchyMap.get(current)) {
        level++;
        current = hierarchyMap.get(current);
      }
      context.nestingLevel = level;
    }

    // Calculate sibling position
    if (parent) {
      const siblings = parent.children.filter(child =>
        t.isJSXElement(child) &&
        child.openingElement &&
        t.isJSXIdentifier(child.openingElement.name) &&
        child.openingElement.name.name === componentName
      );

      context.siblingPosition = siblings.findIndex(sibling => sibling === node);
    }

    componentContextMap.set(node, context);

  } catch (e) {
    // Error building component context
  }
}

/**
 * Helper function to extract text content from JSX elements
 */
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
      } else if (t.isJSXElement(child)) {
        // Recursively extract text from nested elements that typically
        // contain text like <span>, <strong>, <em>, etc.
        const inlineTextElements = ['span', 'strong', 'em', 'b', 'i', 'small', 'mark', 'del', 'ins', 'sub', 'sup'];

        if (child.openingElement && t.isJSXIdentifier(child.openingElement.name) &&
            inlineTextElements.includes(child.openingElement.name.name.toLowerCase())) {
          text += getTextFromJSXElement(child) + ' ';
        }
      }
    });
  }

  return text.trim();
}

/**
 * Helper to sanitize text for use in test IDs
 */
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

/**
 * Helper to extract all classes from a className string
 */
function getClassesFromClassName(className) {
  if (!className) return [];
  // Split by spaces and filter out empty strings
  return className.split(/\s+/).filter(Boolean);
}

/**
 * Helper to find most meaningful class name
 */
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

/**
 * Helper to detect if component is in a loop
 */
function isInLoop(node, path, loopMap, keyPropMap) {
  // Check direct loop info from map
  if (loopMap && node && loopMap.get(node) && loopMap.get(node).isLoop) {
    return true;
  }

  // Check for key prop as indicator of loop
  if (keyPropMap && node && keyPropMap.get(node)) {
    return true;
  }

  // Look for .map() call in the ancestor chain
  if (path) {
    const loopParent = path.findParent(p =>
      p.isJSXExpressionContainer() &&
      p.node.expression &&
      p.node.expression.type === 'CallExpression' &&
      (p.node.expression.callee.name === 'map' ||
       (p.node.expression.callee.property && p.node.expression.callee.property.name === 'map'))
    );

    return !!loopParent;
  }

  return false;
}

/**
 * Helper to get meaningful info from loop context
 */
function getLoopContext(node, componentName, path, loopMap, keyPropMap, wrapperChildMap) {
  // Get key value if available
  const keyValue = keyPropMap && node ? keyPropMap.get(node) : null;
  if (keyValue) {
    // Use key value directly for test ID
    return keyValue;
  }

  // Get wrapper-child relationship if available
  const relationship = wrapperChildMap && node ? wrapperChildMap.get(node) : null;
  if (relationship) {
    return `${relationship.wrapper.toLowerCase()}-${relationship.child.toLowerCase()}`;
  }

  // Try to extract information from loop parent
  if (path) {
    const loopParent = path.findParent(p =>
      p.isJSXExpressionContainer() &&
      p.node.expression &&
      p.node.expression.type === 'CallExpression' &&
      (p.node.expression.callee.name === 'map' ||
       (p.node.expression.callee.property && p.node.expression.callee.property.name === 'map'))
    );

    if (loopParent && loopMap.get(loopParent.node)) {
      const loopInfo = loopMap.get(loopParent.node);
      if (loopInfo.arrayName) {
        // Clean up array name and combine with component
        const arraySuffix = sanitizeForTestId(loopInfo.arrayName);
        return `${arraySuffix}-${componentName.toLowerCase()}`;
      }
    }
  }

  return '';
}

/**
 * Determine if we should use dynamic test ID
 */
function shouldUseDynamicTestId(node, keyExpressionMap, keyPropMap) {
  if (!node || !keyExpressionMap || !keyPropMap) return false;

  // Check if node has key expression with template literals
  const keyExpr = keyExpressionMap.get(node);
  if (keyExpr && t.isTemplateLiteral(keyExpr)) {
    return true;
  }

  // Check if node's key value contains template literal patterns
  const keyValue = keyPropMap.get(node);
  return keyValue && keyValue.includes('${');
}

/**
 * Create JSX expression from key expression for data-testid
 */
function createDynamicTestId(node, prefix = '', keyExpressionMap) {
  if (!node || !keyExpressionMap) return null;

  const keyExpr = keyExpressionMap.get(node);
  if (!keyExpr) return null;

  // If prefix is needed, create a template literal with the prefix
  if (prefix) {
    // Either concatenate strings or create a template literal
    if (t.isTemplateLiteral(keyExpr)) {
      // Create a new template literal with the prefix added to the first quasi
      const newQuasis = [...keyExpr.quasis];
      newQuasis[0] = t.templateElement({
        raw: prefix + newQuasis[0].value.raw,
        cooked: prefix + (newQuasis[0].value.cooked || newQuasis[0].value.raw)
      }, newQuasis[0].tail);

      return t.templateLiteral(newQuasis, [...keyExpr.expressions]);
    } else {
      // For other types of expressions, concatenate with +
      return t.binaryExpression(
        '+',
        t.stringLiteral(prefix),
        keyExpr
      );
    }
  }

  // Otherwise, just use the key expression directly
  return keyExpr;
}

/**
 * Function to generate a unique test ID for a component
 */
function generateTestId(componentName, attributes, parentPath, path, options, counters, testIdCache,
  commentMap, hierarchyMap, classNameMap, loopMap, keyPropMap, keyExpressionMap, idPropMap,
  wrapperChildMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap) {

  // Convert component name to lowercase
  const lowerName = componentName.toLowerCase();

  // Check for cached test ID for similar components
  const componentFingerprint = createComponentFingerprint(componentName, attributes, parentPath);
  if (testIdCache.has(componentFingerprint)) {
    const cachedId = testIdCache.get(componentFingerprint);

    // For loops, still make sure we have unique IDs
    if (isInLoop(parentPath ? parentPath.node : null, path)) {
      return `${cachedId}-${Math.floor(Math.random() * 10000)}`;
    }

    return cachedId;
  }

  // Initialize test ID parts
  // Initialize parts for constructing the test ID
  let suffix = '';
  let attributeFound = false;

  // Check if component is in a loop
  const isLooped = isInLoop(parentPath ? parentPath.node : null, path, loopMap, keyPropMap);

  // Check if we should use dynamic test ID based on key
  if (isLooped && parentPath && shouldUseDynamicTestId(parentPath.node, keyExpressionMap, keyPropMap)) {
    // Get the key value (for logging purposes)
    const keyValue = keyPropMap.get(parentPath.node);
    if (options.verbose) console.log(`Using dynamic key for test ID: ${keyValue}`);

    // Return a special marker to indicate dynamic test ID should be used
    return {
      isDynamic: true,
      node: parentPath.node
    };
  }

  // 1. First priority: Check for rich component context
  const context = parentPath ? componentContextMap.get(parentPath.node) : null;
  if (context) {
    // Use context to create a semantic test ID
    if (context.role) {
      suffix = `${context.role}`;
      attributeFound = true;
      if (options.verbose) console.log(`Using ARIA role: ${suffix}`);
    } else if (context.interactive && context.interactive.isInteractive) {
      suffix = context.interactive.interactionType;
      attributeFound = true;
      if (options.verbose) console.log(`Using interactive element type: ${suffix}`);
    } else if (context.semanticGroup) {
      suffix = `${context.semanticGroup.group}-${context.semanticGroup.role}`;
      attributeFound = true;
      if (options.verbose) console.log(`Using semantic group: ${suffix}`);
    } else if (context.text) {
      suffix = sanitizeForTestId(context.text);
      attributeFound = true;
      if (options.verbose) console.log(`Using text content: ${suffix}`);
    }

    // For nested elements, add parent context
    if (context.parentName && !suffix.includes(context.parentName.toLowerCase())) {
      if (attributeFound) {
        suffix = `${context.parentName.toLowerCase()}-${suffix}`;
      } else {
        suffix = `${context.parentName.toLowerCase()}`;
        attributeFound = true;
      }
    }
  }

  // 2. Look for existing semantic identifiers if we didn't find anything from context
  if (!attributeFound) {
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

    // d) Look for id prop
    if (!attributeFound) {
      const idValue = idPropMap.get(parentPath ? parentPath.node : null);
      if (idValue) {
        suffix = sanitizeForTestId(idValue);
        attributeFound = true;
        if (options.verbose) console.log(`Using id attribute: ${suffix}`);
      }
    }

    // e) Check for loop context if in a loop
    if (isLooped && !attributeFound) {
      const loopContext = getLoopContext(parentPath ? parentPath.node : null, componentName, path, loopMap, keyPropMap, wrapperChildMap);
      if (loopContext) {
        suffix = loopContext;
        attributeFound = true;
        if (options.verbose) console.log(`Using loop context: ${suffix}`);
      }
    }

    // 3. Check for className
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

    // 4. Check for semantic props for UI components
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

    // 5. For buttons, links and clickable elements, look for onClick handlers
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

    // 6. For Image components, use src context
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

    // 7. Use text content if available and option is enabled
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

    // 8. Check for comments if option is enabled
    if (options.commentBased && !attributeFound && parentPath) {
      const jsxElement = parentPath.node;
      const commentText = commentMap.get(jsxElement) || '';

      if (commentText) {
        // Look for descriptive patterns in comments
        // Patterns like: "User profile", "Navigation menu", "Search form", etc.
        const semanticPatterns = [
          /\b(header|footer|navigation|nav|sidebar|main|content|user|profile|search|form|input|button|list|item|container|wrapper|section|panel|card|modal|dialog|popover|tooltip|menu|dropdown)\b/i,
          /\b(\w+)\s+(section|area|region|component|element|container|wrapper|view|panel|group)\b/i,
        ];

        let commentContext = '';

        for (const pattern of semanticPatterns) {
          const match = commentText.match(pattern);
          if (match) {
            commentContext = match[0].toLowerCase().replace(/\s+/g, '-');
            break;
          }
        }

        // If no pattern matches, extract meaningful words
        if (!commentContext) {
          const words = commentText
            .split(/\s+/)
            .filter(word =>
              word.length > 2 &&
              !/^[0-9.]+$/.test(word) &&
              !['the', 'and', 'for', 'with', 'this', 'that'].includes(word.toLowerCase())
            )
            .slice(0, 3); // Take up to 3 words

          if (words.length > 0) {
            commentContext = words.join('-').toLowerCase().replace(/[^\w-]+/g, '');
          }
        }

        if (commentContext) {
          suffix = commentContext;
          attributeFound = true;
          if (options.verbose) console.log(`Using comment context: ${suffix}`);
        }
      }
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
    baseId = getComponentRoleBasedId(lowerName);
  }

  // Apply user-provided prefix
  const prefixedId = options.prefix ? options.prefix + baseId : baseId;

  // Ensure uniqueness
  if (!counters[prefixedId]) {
    counters[prefixedId] = 0;
  }

  counters[prefixedId]++;

  // For first item of a kind, prefer not to add numeric suffix
  if (counters[prefixedId] === 1 && !isLooped) {
    testIdCache.set(componentFingerprint, prefixedId);
    return prefixedId;
  }

  // For looped items, use the key directly if we have access to key info
  if (isLooped) {
    const keyValue = keyPropMap.get(parentPath ? parentPath.node : null);
    if (keyValue) {
      // If the key prop exists, use it directly as the test ID
      const keyBasedId = options.prefix ? options.prefix + keyValue : keyValue;
      testIdCache.set(componentFingerprint, keyBasedId);
      return keyBasedId;
    }
  }

  const uniqueId = `${prefixedId}-${counters[prefixedId]}`;
  testIdCache.set(componentFingerprint, uniqueId);
  return uniqueId;
}

/**
 * Create a fingerprint for component caching
 */
function createComponentFingerprint(componentName, attributes, parentPath) {
  const attributeNames = attributes
    .filter(attr => t.isJSXAttribute(attr))
    .map(attr => attr.name.name)
    .sort()
    .join(',');

  const parentComponent = parentPath && parentPath.node.openingElement &&
    t.isJSXIdentifier(parentPath.node.openingElement.name) ?
    parentPath.node.openingElement.name.name : 'none';

  return `${componentName}:${attributeNames}:${parentComponent}`;
}

/**
 * Get component ID based on semantic role
 */
function getComponentRoleBasedId(lowerName) {
  switch(lowerName) {
    case 'div':
      return 'container';
    case 'button':
      return 'btn';
    case 'img':
    case 'image':
      return 'img';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'list-item';
    case 'input':
      return 'input-field';
    case 'select':
      return 'dropdown';
    case 'textarea':
      return 'text-area';
    case 'a':
    case 'link':
      return 'link';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'p':
      return 'paragraph';
    case 'span':
      return 'text';
    case 'nav':
      return 'navigation';
    case 'header':
      return 'header';
    case 'footer':
      return 'footer';
    case 'form':
      return 'form';
    case 'section':
      return 'section';
    case 'article':
      return 'article';
    case 'main':
      return 'main-content';
    case 'aside':
      return 'sidebar';
    case 'dialog':
    case 'modal':
      return 'dialog';
    case 'table':
      return 'table';
    case 'tr':
      return 'table-row';
    case 'td':
      return 'table-cell';
    case 'th':
      return 'table-header';
    default:
      return lowerName;
  }
}

/**
 * Process the AST and add data-testid attributes
 */
function addTestIds(ast, chakraComponents, customComponents, htmlElements, options, counters, testIdCache,
  commentMap, hierarchyMap, classNameMap, loopMap, keyPropMap, keyExpressionMap, idPropMap,
  wrapperChildMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap) {

  // Count of attributes added
  let addedCount = 0;
  const componentTypesCount = {
    chakra: 0,
    custom: 0,
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

      // Determine if this is a UI component or HTML element we want to process
      const isChakraComponent = chakraComponents.has(componentName);
      const isCustomComponent = customComponents.has(componentName);
      const isHtmlElement = htmlElements.has(componentName.toLowerCase());

      // Skip processing based on options
      if ((options.htmlOnly && !isHtmlElement) ||
          (options.chakraOnly && !isChakraComponent) ||
          (!isChakraComponent && !isCustomComponent && !isHtmlElement && !options.includeHtml) ||
          isNamespaced) { // Skip namespaced elements
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
      const testIdResult = generateTestId(componentName, node.attributes, parentPath, path, options, counters, testIdCache,
        commentMap, hierarchyMap, classNameMap, loopMap, keyPropMap, keyExpressionMap, idPropMap,
        wrapperChildMap, roleMap, semanticGroupMap, interactiveElementMap, componentContextMap);

      // Handle dynamic test IDs
      if (typeof testIdResult === 'object' && testIdResult.isDynamic) {
        // Create a dynamic data-testid using the key expression
        const dynamicExpr = createDynamicTestId(testIdResult.node, options.prefix, keyExpressionMap);
        if (dynamicExpr) {
          // Create JSX attribute with expression container
          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-testid'),
              t.jsxExpressionContainer(dynamicExpr)
            )
          );
          addedCount++;
        } else {
          // Fallback to static test ID if dynamic creation fails
          const fallbackId = `${componentName.toLowerCase()}-dynamic-${addedCount + 1}`;
          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('data-testid'),
              t.stringLiteral(options.prefix ? options.prefix + fallbackId : fallbackId)
            )
          );
          addedCount++;
        }
      } else {
        // Regular string test ID
        node.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('data-testid'),
            t.stringLiteral(testIdResult)
          )
        );
        addedCount++;
      }

      // Track component type
      if (isChakraComponent) {
        componentTypesCount.chakra++;
      } else if (isCustomComponent) {
        componentTypesCount.custom++;
      } else {
        componentTypesCount.html++;
      }
    }
  });

  return { addedCount, componentTypesCount };
}