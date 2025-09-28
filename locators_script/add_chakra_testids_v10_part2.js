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
    testIdRegistry: new Set(), // Registry of all generated test IDs to ensure uniqueness
    commentMap: new Map(), // Map to store leading comments for nodes
    hierarchyMap: new Map(), // Map to store component hierarchy for context
    classNameMap: new Map(), // Map to store class names for components
    sxPropMap: new Map(), // Map to store sx prop values
    loopMap: new Map(), // Map to store loop info for components
    keyPropMap: new Map(), // Map to store key props for components
    keyExpressionMap: new Map(), // Map to store raw key expression for components
    idPropMap: new Map(), // Map to store id props for components
    wrapperChildMap: new Map(), // Map to store wrapper-child relationships
    roleMap: new Map(), // Map to store ARIA roles for components
    semanticGroupMap: new Map(), // Map to store semantic grouping for components
    interactiveElementMap: new Map(), // Map to identify interactive elements
    componentContextMap: new Map(), // Map to store rich context for each component
    pathMap: new Map(), // Map to store component path information
    childTextMap: new Map(), // Map to store text from child elements

    // New in v10: Enhanced data structures
    componentStateMap: new Map(), // Map to store component state info (loading, disabled, etc.)
    conditionalMap: new Map(), // Map to store conditional rendering patterns
    deepPropMap: new Map(), // Map to store deeply analyzed props
    logicalGroupMap: new Map(), // Map for logical component groups (forms, navigation, etc.)
    componentRoleMap: new Map() // Map for inferred component roles
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
    emotion: false,
    // New in v10: Additional frameworks
    nextUI: false,
    radixUI: false,
    headlessUI: false,
    shadcnUI: false,
    mantine: false
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
  if (fileContent.includes('tailwind') ||
      /className=["'].*?[^-](?:flex|grid|text-\w+)/.test(fileContent) ||
      /className=["'].*?(?:bg-|text-|border-|rounded-|shadow-|p-[0-9]|m-[0-9])/.test(fileContent)) {
    frameworks.tailwindCSS = true;
  }

  // Check for Bootstrap
  if (fileContent.includes('react-bootstrap') ||
      fileContent.includes('bootstrap') ||
      /className=["'].*?(?:container|row|col-|btn-|form-|card|navbar|modal)/.test(fileContent)) {
    frameworks.bootstrap = true;
  }

  // Check for Emotion
  if (fileContent.includes('@emotion/') || fileContent.includes('css`')) {
    frameworks.emotion = true;
  }

  // New in v10: Check for NextUI
  if (fileContent.includes('@nextui-org/') ||
      fileContent.includes('nextui') ||
      /import.*?from ["']@nextui/.test(fileContent)) {
    frameworks.nextUI = true;
  }

  // New in v10: Check for Radix UI
  if (fileContent.includes('@radix-ui/') ||
      /import.*?from ["']@radix/.test(fileContent)) {
    frameworks.radixUI = true;
  }

  // New in v10: Check for Headless UI
  if (fileContent.includes('@headlessui/') ||
      /import.*?from ["']@headlessui/.test(fileContent)) {
    frameworks.headlessUI = true;
  }

  // New in v10: Check for shadcn/ui
  if (fileContent.includes('@shadcn/ui') ||
      fileContent.includes('shadcn/ui') ||
      /import.*?from ["']@?shadcn/.test(fileContent)) {
    frameworks.shadcnUI = true;
  }

  // New in v10: Check for Mantine
  if (fileContent.includes('@mantine/') ||
      /import.*?from ["']@mantine/.test(fileContent)) {
    frameworks.mantine = true;
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

  // New in v10: Additional framework regexes
  const nextUIRegex = /@nextui-org\/\w+|nextui/g;
  const radixUIRegex = /@radix-ui\/\w+/g;
  const headlessUIRegex = /@headlessui\/\w+/g;
  const shadcnUIRegex = /@?shadcn\/ui/g;
  const mantineRegex = /@mantine\/\w+/g;

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
    // New in v10: Check for NextUI
    else if (frameworks.nextUI && packageName.match(nextUIRegex)) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        customComponents.add(finalName);
      });
    }
    // New in v10: Check for Radix UI
    else if (frameworks.radixUI && packageName.match(radixUIRegex)) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        customComponents.add(finalName);
      });
    }
    // New in v10: Check for Headless UI
    else if (frameworks.headlessUI && packageName.match(headlessUIRegex)) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        customComponents.add(finalName);
      });
    }
    // New in v10: Check for shadcn/ui
    else if (frameworks.shadcnUI && packageName.match(shadcnUIRegex)) {
      imports.forEach(importName => {
        const finalName = importName.includes(' as ')
          ? importName.split(' as ')[1].trim()
          : importName.trim();
        customComponents.add(finalName);
      });
    }
    // New in v10: Check for Mantine
    else if (frameworks.mantine && packageName.match(mantineRegex)) {
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
    }
    // New in v10: Additional framework checks for default imports
    else if (frameworks.nextUI && packageName.match(nextUIRegex)) {
      customComponents.add(componentName);
    }
    else if (frameworks.radixUI && packageName.match(radixUIRegex)) {
      customComponents.add(componentName);
    }
    else if (frameworks.headlessUI && packageName.match(headlessUIRegex)) {
      customComponents.add(componentName);
    }
    else if (frameworks.shadcnUI && packageName.match(shadcnUIRegex)) {
      customComponents.add(componentName);
    }
    else if (frameworks.mantine && packageName.match(mantineRegex)) {
      customComponents.add(componentName);
    }
    else if (isLikelyComponent(componentName)) {
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

  // New in v10: Extract hook-based custom components (for headless libraries)
  const hookBasedComponentRegex = /function\s+(\w+).*?\{\s*(?:const|let|var)\s+\w+\s*=\s*use(?:[\w]+)\(/g;
  while ((match = hookBasedComponentRegex.exec(fileContent)) !== null) {
    const componentName = match[1];
    if (componentName && !chakraComponents.has(componentName) && !customComponents.has(componentName) && isLikelyComponent(componentName)) {
      customComponents.add(componentName);
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
    // Standard components
    /Button$/, /Card$/, /Container$/, /Dialog$/, /Dropdown$/,
    /Form$/, /Grid$/, /Header$/, /Icon$/, /Input$/, /Item$/,
    /List$/, /Menu$/, /Modal$/, /Nav$/, /Panel$/, /Popover$/,
    /Section$/, /Select$/, /Sidebar$/, /Table$/, /Tabs$/,
    /Text$/, /Tooltip$/, /View$/, /Wrapper$/,

    // New in v10: Additional component patterns
    /Provider$/, /Context$/, /Component$/,
    /Avatar$/, /Badge$/, /Banner$/, /Calendar$/, /Chart$/,
    /Drawer$/, /Editor$/, /Field$/, /Layout$/, /Page$/,
    /Preview$/, /Progress$/, /Skeleton$/, /Spinner$/, /Toast$/,
    /^App/, /^Page/, /^Form/, /^Modal/, /^Dialog/, /^Card/,
    /^Nav/, /^Menu/, /^Tab/, /^List/, /^Item/, /^Button/
  ];

  return componentPatterns.some(pattern => pattern.test(name));
}

/**
 * First pass to gather component context information
 */
function gatherComponentContext(
  ast,
  commentMap,
  hierarchyMap,
  classNameMap,
  sxPropMap,
  loopMap,
  keyPropMap,
  keyExpressionMap,
  idPropMap,
  wrapperChildMap,
  roleMap,
  semanticGroupMap,
  interactiveElementMap,
  componentContextMap,
  pathMap,
  childTextMap,
  // New v10 data structures
  componentStateMap,
  conditionalMap,
  deepPropMap,
  logicalGroupMap,
  componentRoleMap,
  frameworks,
  options
) {
  // First build a path map for each element
  let currentPath = [];

  // First pass: Build path map and detect control flow patterns
  traverse(ast, {
    enter(path) {
      if (path.isJSXElement()) {
        const elementName = getElementName(path.node);
        if (elementName) {
          currentPath.push(elementName);
          // Store the current path for this node
          pathMap.set(path.node, [...currentPath]);
        }
      }

      // New in v10: Detect conditional rendering patterns
      if (options.conditionAware) {
        detectConditionalRendering(path, conditionalMap);
      }
    },
    exit(path) {
      if (path.isJSXElement()) {
        const elementName = getElementName(path.node);
        if (elementName) {
          currentPath.pop();
        }
      }
    }
  });

  // Second pass: Collect component attributes, state, and role info
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
        extractElementAttributes(
          path,
          classNameMap,
          sxPropMap,
          keyPropMap,
          keyExpressionMap,
          idPropMap,
          roleMap,
          // New in v10: Additional maps
          componentStateMap,
          deepPropMap,
          frameworks,
          options
        );

        recordElementRelationships(
          path,
          hierarchyMap,
          wrapperChildMap,
          semanticGroupMap,
          // New in v10: Additional maps
          logicalGroupMap
        );

        identifyInteractiveElements(path, interactiveElementMap);

        // New in v10: Infer component roles
        if (options.roleInference) {
          inferComponentRole(path, componentRoleMap, frameworks);
        }

        // Extract text from child elements for better context
        if (options.useChildText) {
          const elementText = getTextFromJSXElement(path.node, true);
          if (elementText) {
            childTextMap.set(path.node, elementText);
          }
        }
      }
    }
  });

  // Third pass: Build component context based on gathered information
  traverse(ast, {
    JSXElement(path) {
      buildComponentContext(
        path,
        hierarchyMap,
        classNameMap,
        sxPropMap,
        commentMap,
        roleMap,
        semanticGroupMap,
        interactiveElementMap,
        componentContextMap,
        pathMap,
        childTextMap,
        // New v10 data structures
        componentStateMap,
        conditionalMap,
        deepPropMap,
        logicalGroupMap,
        componentRoleMap,
        frameworks,
        options
      );
    }
  });

  // New in v10: Final pass to identify logical groups of components
  if (options.groupDetection) {
    identifyLogicalGroups(ast, logicalGroupMap, hierarchyMap, componentContextMap);
  }
}

/**
 * Get element name from JSXElement node
 */
function getElementName(node) {
  if (!node || !node.openingElement || !node.openingElement.name) {
    return null;
  }

  if (t.isJSXIdentifier(node.openingElement.name)) {
    return node.openingElement.name.name;
  } else if (t.isJSXMemberExpression(node.openingElement.name)) {
    return node.openingElement.name.property.name;
  }

  return null;
}

/**
 * New in v10: Detect conditional rendering patterns
 */
function detectConditionalRendering(path, conditionalMap) {
  // Check for ternary expressions in JSX
  if (path.isConditionalExpression() &&
      (path.parent.type === 'JSXExpressionContainer' ||
       path.findParent(p => p.isJSXElement()))) {

    let conditionType = 'unknown';
    let conditionVar = '';

    // Extract condition variable and type
    const condition = path.node.test;
    if (t.isIdentifier(condition)) {
      conditionVar = condition.name;
      conditionType = getConditionTypeFromName(conditionVar);
    } else if (t.isMemberExpression(condition)) {
      try {
        conditionVar = condition.property.name;
        conditionType = getConditionTypeFromName(conditionVar);
      } catch (e) {
        // Unable to extract
      }
    } else if (t.isBinaryExpression(condition)) {
      try {
        if (t.isIdentifier(condition.left)) {
          conditionVar = condition.left.name;
          conditionType = getConditionTypeFromName(conditionVar);
        } else if (t.isMemberExpression(condition.left)) {
          conditionVar = condition.left.property.name;
          conditionType = getConditionTypeFromName(conditionVar);
        }
      } catch (e) {
        // Unable to extract
      }
    }

    // Find the JSX elements in the consequent and alternate branches
    const consequent = path.get('consequent');
    const alternate = path.get('alternate');

    if (consequent.isJSXElement()) {
      conditionalMap.set(consequent.node, {
        type: conditionType,
        variable: conditionVar,
        branch: 'consequent',
        condition: generateConditionString(condition)
      });
    }

    if (alternate.isJSXElement()) {
      conditionalMap.set(alternate.node, {
        type: conditionType,
        variable: conditionVar,
        branch: 'alternate',
        condition: generateConditionString(condition)
      });
    }
  }

  // Check for logical expressions (&& operator) in JSX
  if (path.isLogicalExpression() && path.node.operator === '&&' &&
      (path.parent.type === 'JSXExpressionContainer' ||
       path.findParent(p => p.isJSXElement()))) {

    let conditionType = 'unknown';
    let conditionVar = '';

    // Extract condition variable and type
    const condition = path.node.left;
    if (t.isIdentifier(condition)) {
      conditionVar = condition.name;
      conditionType = getConditionTypeFromName(conditionVar);
    } else if (t.isMemberExpression(condition)) {
      try {
        conditionVar = condition.property.name;
        conditionType = getConditionTypeFromName(conditionVar);
      } catch (e) {
        // Unable to extract
      }
    }

    // Find the JSX element in the right side
    const right = path.get('right');
    if (right.isJSXElement()) {
      conditionalMap.set(right.node, {
        type: conditionType,
        variable: conditionVar,
        branch: 'conditional',
        condition: generateConditionString(condition)
      });
    }
  }
}

/**
 * New in v10: Infer condition type from variable name
 */
function getConditionTypeFromName(name) {
  if (!name) return 'unknown';

  name = name.toLowerCase();

  if (name.includes('loading') || name.includes('progress') || name.includes('pending')) {
    return 'loading';
  } else if (name.includes('error') || name.includes('failed') || name.includes('exception')) {
    return 'error';
  } else if (name.includes('success') || name.includes('completed') || name.includes('done')) {
    return 'success';
  } else if (name.includes('empty') || name.includes('no') || name.includes('zero') || name.includes('null')) {
    return 'empty';
  } else if (name.includes('is') || name.includes('has') || name.includes('should') || name.includes('can')) {
    return 'boolean';
  } else if (name.includes('show') || name.includes('display') || name.includes('visible') || name.includes('open')) {
    return 'visibility';
  } else if (name.includes('enabled') || name.includes('disabled') || name.includes('active')) {
    return 'state';
  }

  return 'unknown';
}

/**
 * New in v10: Generate a string representation of the condition
 */
function generateConditionString(condition) {
  if (t.isIdentifier(condition)) {
    return condition.name;
  } else if (t.isMemberExpression(condition)) {
    try {
      const object = condition.object.name || 'obj';
      const property = condition.property.name || 'prop';
      return `${object}.${property}`;
    } catch (e) {
      return 'unknown.condition';
    }
  } else if (t.isBinaryExpression(condition)) {
    try {
      const left = t.isIdentifier(condition.left) ? condition.left.name :
                  (t.isMemberExpression(condition.left) ? `${condition.left.object.name}.${condition.left.property.name}` : '?');
      const right = t.isLiteral(condition.right) ? condition.right.value : '?';
      return `${left} ${condition.operator} ${right}`;
    } catch (e) {
      return 'binary.condition';
    }
  }

  return 'condition';
}

/**
 * New in v10: Infer the semantic role of a component
 */
function inferComponentRole(path, componentRoleMap, frameworks) {
  const node = path.node;
  let role = '';

  // Check element name first
  const elementName = getElementName(node);
  if (!elementName) return;

  const elementNameLower = elementName.toLowerCase();

  // Check semantic HTML elements
  if (elementNameLower === 'button' || elementName === 'Button') {
    role = 'button';
  } else if (elementNameLower === 'a' || elementNameLower === 'link' || elementName === 'Link') {
    role = 'link';
  } else if (elementNameLower === 'input') {
    // Check input type
    const typeAttr = node.openingElement.attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === 'type'
    );
    if (typeAttr && t.isStringLiteral(typeAttr.value)) {
      role = `input-${typeAttr.value.value}`;
    } else {
      role = 'input';
    }
  } else if (/^h[1-6]$/.test(elementNameLower) || elementName === 'Heading') {
    role = 'heading';
  } else if (elementNameLower === 'img' || elementName === 'Image') {
    role = 'image';
  } else if (elementNameLower === 'nav' || elementName === 'Navigation') {
    role = 'navigation';
  } else if (elementNameLower === 'form' || elementName === 'Form') {
    role = 'form';
  }

  // Check for component name patterns
  if (!role) {
    if (/Button$/.test(elementName)) {
      role = 'button';
    } else if (/Nav(igation)?$/.test(elementName) || /Menu/.test(elementName)) {
      role = 'navigation';
    } else if (/Form$/.test(elementName)) {
      role = 'form';
    } else if (/Input$/.test(elementName) || /Field$/.test(elementName)) {
      role = 'input';
    } else if (/Card$/.test(elementName)) {
      role = 'card';
    } else if (/Table$/.test(elementName) || /Grid$/.test(elementName)) {
      role = 'table';
    } else if (/List$/.test(elementName)) {
      role = 'list';
    } else if (/Item$/.test(elementName)) {
      role = 'item';
    } else if (/Container$/.test(elementName) || /Wrapper$/.test(elementName)) {
      role = 'container';
    } else if (/Header$/.test(elementName)) {
      role = 'header';
    } else if (/Footer$/.test(elementName)) {
      role = 'footer';
    } else if (/Modal$/.test(elementName) || /Dialog$/.test(elementName)) {
      role = 'dialog';
    } else if (/Drawer$/.test(elementName)) {
      role = 'drawer';
    }
  }

  // Check for framework-specific patterns
  if (!role && frameworks) {
    if (frameworks.chakraUI) {
      if (elementName === 'Box' || elementName === 'Flex' || elementName === 'Stack' ||
          elementName === 'HStack' || elementName === 'VStack') {
        role = 'container';
      } else if (elementName === 'Text') {
        role = 'text';
      } else if (elementName === 'Icon') {
        role = 'icon';
      } else if (elementName === 'Avatar') {
        role = 'avatar';
      }
    } else if (frameworks.materialUI) {
      if (elementName === 'Paper' || elementName === 'Box' || elementName === 'Container') {
        role = 'container';
      } else if (elementName === 'Typography') {
        role = 'text';
      } else if (elementName === 'Icon' || elementName.endsWith('Icon')) {
        role = 'icon';
      }
    }
  }

  if (role) {
    componentRoleMap.set(node, role);
  }
}

/**
 * New in v10: Identify logical groups of components based on their relationships
 */
function identifyLogicalGroups(ast, logicalGroupMap, hierarchyMap, componentContextMap) {
  // The groups we want to identify
  const groupTypes = {
    FORM: 'form',
    NAVIGATION: 'navigation',
    LIST: 'list',
    TABLE: 'table',
    CARD: 'card',
    SEARCH: 'search',
    AUTH: 'authentication',
    DIALOG: 'dialog',
    PAGINATION: 'pagination',
    LAYOUT: 'layout',
    HEADER: 'header',
    FOOTER: 'footer'
  };

  // Traverse and identify logical groups
  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const context = componentContextMap.get(node);

      if (!context) return;

      // Check for form groups
      if (context.name === 'form' || context.name === 'Form' ||
          context.parentName === 'form' || context.parentName === 'Form' ||
          context.name.includes('Form') ||
          (context.comments &&
          /\b(form|signup|login|register|submit|input)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.FORM,
          role: context.parentName === 'form' || context.parentName === 'Form' ? 'field' : 'form'
        });
      }

      // Check for navigation groups
      else if (context.name === 'nav' || context.name === 'Nav' ||
              context.name.includes('Nav') || context.name.includes('Menu') ||
              context.parentName === 'nav' || context.parentName === 'Nav' ||
              context.parentName.includes('Nav') || context.parentName.includes('Menu') ||
              (context.comments &&
              /\b(navigation|navbar|menu|header|tabs|breadcrumb)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.NAVIGATION,
          role: context.parentName === 'nav' || context.parentName === 'Nav' ||
                context.parentName.includes('Nav') ? 'item' : 'container'
        });
      }

      // Check for list groups
      else if (context.name === 'ul' || context.name === 'ol' || context.name === 'li' ||
              context.name.includes('List') || context.parentName.includes('List') ||
              (context.comments &&
              /\b(list|items|results|collection)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.LIST,
          role: context.name === 'li' || context.name.includes('Item') ? 'item' : 'list'
        });
      }

      // Check for table groups
      else if (context.name === 'table' || context.name === 'tr' ||
              context.name === 'td' || context.name === 'th' ||
              context.name.includes('Table') || context.name.includes('Grid') ||
              context.parentName.includes('Table') || context.parentName.includes('Grid') ||
              (context.comments &&
              /\b(table|grid|data|row|column)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.TABLE,
          role: context.name === 'tr' || context.name === 'Row' ? 'row' :
                context.name === 'td' || context.name === 'th' || context.name === 'Cell' ? 'cell' : 'table'
        });
      }

      // Check for card groups
      else if (context.name.includes('Card') || context.parentName.includes('Card') ||
              (context.comments &&
              /\b(card|panel|tile)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.CARD,
          role: context.parentName.includes('Card') ? 'content' : 'card'
        });
      }

      // Check for search components
      else if (context.name.includes('Search') || context.parentName.includes('Search') ||
              (context.comments &&
              /\b(search|filter|find)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.SEARCH,
          role: context.name.includes('Input') ? 'input' : 'container'
        });
      }

      // Check for auth components
      else if ((context.comments &&
              /\b(login|register|signup|auth|password|username|email|credentials)\b/i.test(context.comments)) ||
              context.name.includes('Login') || context.name.includes('Register') ||
              context.name.includes('Auth') || context.name.includes('Password')) {
        logicalGroupMap.set(node, {
          type: groupTypes.AUTH,
          role: context.name.includes('Form') ? 'form' :
                context.name.includes('Button') ? 'button' : 'container'
        });
      }

      // Check for dialog components
      else if (context.name.includes('Dialog') || context.name.includes('Modal') ||
              context.parentName.includes('Dialog') || context.parentName.includes('Modal') ||
              (context.comments &&
              /\b(dialog|modal|popup|overlay)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.DIALOG,
          role: context.name.includes('Header') ? 'header' :
                context.name.includes('Footer') ? 'footer' :
                context.name.includes('Body') || context.name.includes('Content') ? 'content' : 'container'
        });
      }

      // Check for pagination components
      else if (context.name.includes('Pagination') || context.parentName.includes('Pagination') ||
              (context.comments &&
              /\b(pagination|pager|page\s+nav)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.PAGINATION,
          role: context.name.includes('Item') || context.name.includes('Button') ? 'item' : 'container'
        });
      }

      // Check for layout components
      else if (context.name.includes('Layout') || context.name.includes('Container') ||
              context.name === 'Box' || context.name === 'Flex' || context.name.includes('Stack') ||
              (context.comments &&
              /\b(layout|container|wrapper|section|area|region)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.LAYOUT,
          role: 'container'
        });
      }

      // Check for header components
      else if (context.name === 'header' || context.name.includes('Header') ||
              (context.comments &&
              /\b(header|app\s+bar|title\s+bar|top\s+bar)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.HEADER,
          role: 'header'
        });
      }

      // Check for footer components
      else if (context.name === 'footer' || context.name.includes('Footer') ||
              (context.comments &&
              /\b(footer|bottom\s+bar)\b/i.test(context.comments))) {
        logicalGroupMap.set(node, {
          type: groupTypes.FOOTER,
          role: 'footer'
        });
      }
    }
  });
}

/**
 * Extract various attributes from a JSX element
 */
function extractElementAttributes(
  path,
  classNameMap,
  sxPropMap,
  keyPropMap,
  keyExpressionMap,
  idPropMap,
  roleMap,
  // New in v10: Additional maps
  componentStateMap,
  deepPropMap,
  frameworks,
  options
) {
  const node = path.node;
  const openingElement = node.openingElement;

  if (openingElement && openingElement.attributes) {
    // Extract className
    if (options.classBased) {
      extractClassName(node, openingElement.attributes, classNameMap, frameworks);
    }

    // Extract sx prop
    if (options.sxBased) {
      extractSxProp(node, openingElement.attributes, sxPropMap, frameworks);
    }

    // Extract key prop
    extractKeyProp(node, openingElement.attributes, keyPropMap, keyExpressionMap);

    // Extract id prop
    extractIdProp(node, openingElement.attributes, idPropMap);

    // Extract ARIA role
    extractRole(node, openingElement.attributes, roleMap);

    // New in v10: Extract component state information
    if (options.stateAware) {
      extractComponentState(node, openingElement.attributes, componentStateMap);
    }

    // New in v10: Extract deep prop analysis
    if (options.deepProps) {
      extractDeepProps(node, openingElement.attributes, deepPropMap);
    }
  }
}

/**
 * New in v10: Extract component state information (loading, disabled, active, etc.)
 */
function extractComponentState(node, attributes, componentStateMap) {
  const stateAttributes = [
    // Boolean state props
    { name: 'disabled', state: 'disabled' },
    { name: 'readOnly', state: 'readonly' },
    { name: 'checked', state: 'checked' },
    { name: 'selected', state: 'selected' },
    { name: 'active', state: 'active' },
    { name: 'expanded', state: 'expanded' },
    { name: 'collapsed', state: 'collapsed' },
    { name: 'hidden', state: 'hidden' },
    { name: 'required', state: 'required' },
    { name: 'open', state: 'open' },
    { name: 'closed', state: 'closed' },
    { name: 'highlighted', state: 'highlighted' },

    // Loading states
    { name: 'isLoading', state: 'loading' },
    { name: 'loading', state: 'loading' },
    { name: 'isFetching', state: 'loading' },
    { name: 'isPending', state: 'loading' },

    // Error states
    { name: 'isError', state: 'error' },
    { name: 'error', state: 'error' },
    { name: 'hasError', state: 'error' },
    { name: 'invalid', state: 'error' },
    { name: 'isInvalid', state: 'error' },

    // Success states
    { name: 'isSuccess', state: 'success' },
    { name: 'success', state: 'success' },
    { name: 'isValid', state: 'success' },
    { name: 'valid', state: 'success' },
    { name: 'completed', state: 'success' },

    // Other states
    { name: 'variant', state: 'variant' },
    { name: 'size', state: 'size' },
    { name: 'color', state: 'color' },
    { name: 'colorScheme', state: 'color' },
    { name: 'status', state: 'status' }
  ];

  const states = {};

  // Check for each state attribute
  for (const stateAttr of stateAttributes) {
    const attr = attributes.find(
      attr => t.isJSXAttribute(attr) && attr.name.name === stateAttr.name
    );

    if (attr) {
      if (!attr.value) {
        // Boolean attribute without value (e.g., <Button disabled />)
        states[stateAttr.state] = true;
      } else if (t.isStringLiteral(attr.value)) {
        // String literal value (e.g., <Button variant="outline" />)
        states[stateAttr.state] = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        // Expression value
        const expr = attr.value.expression;
        if (t.isBooleanLiteral(expr)) {
          states[stateAttr.state] = expr.value;
        } else if (t.isStringLiteral(expr)) {
          states[stateAttr.state] = expr.value;
        } else if (t.isIdentifier(expr)) {
          states[stateAttr.state] = expr.name;
        } else if (t.isMemberExpression(expr)) {
          try {
            const property = expr.property.name;
            states[stateAttr.state] = property;
          } catch (e) {
            // Unable to extract
          }
        }
      }
    }
  }

  // Only set state map if we found state information
  if (Object.keys(states).length > 0) {
    componentStateMap.set(node, states);
  }
}

/**
 * New in v10: Extract deep prop analysis
 */
function extractDeepProps(node, attributes, deepPropMap) {
  const semanticProps = {};

  // Analyze all attributes
  for (const attr of attributes) {
    if (!t.isJSXAttribute(attr)) continue;

    const name = attr.name.name;

    // Skip data-testid and internal React props
    if (name === 'data-testid' || name === 'key' || name === 'ref') continue;

    // Extract value based on type
    let value = null;

    if (!attr.value) {
      // Boolean attribute
      value = true;
    } else if (t.isStringLiteral(attr.value)) {
      value = attr.value.value;
    } else if (t.isJSXExpressionContainer(attr.value)) {
      const expr = attr.value.expression;
      if (t.isBooleanLiteral(expr)) {
        value = expr.value;
      } else if (t.isStringLiteral(expr)) {
        value = expr.value;
      } else if (t.isNumericLiteral(expr)) {
        value = expr.value;
      } else if (t.isIdentifier(expr)) {
        value = expr.name;
      } else if (t.isMemberExpression(expr)) {
        try {
          const property = expr.property.name;
          const object = expr.object.name || '';
          value = `${object}.${property}`;
        } catch (e) {
          // Unable to extract
          value = 'expression';
        }
      } else if (t.isObjectExpression(expr)) {
        value = 'object';
      } else if (t.isArrayExpression(expr)) {
        value = 'array';
      } else if (t.isFunctionExpression(expr) || t.isArrowFunctionExpression(expr)) {
        value = 'function';
      } else {
        value = 'expression';
      }
    }

    if (value !== null) {
      semanticProps[name] = value;
    }
  }

  // Only set map if we found properties
  if (Object.keys(semanticProps).length > 0) {
    deepPropMap.set(node, semanticProps);
  }
}

/**
 * Extract className attribute from element
 */
function extractClassName(node, attributes, classNameMap, frameworks) {
  const classNameAttr = attributes.find(
    attr => t.isJSXAttribute(attr) && attr.name.name === 'className'
  );

  if (classNameAttr) {
    let className = '';
    if (t.isStringLiteral(classNameAttr.value)) {
      className = classNameAttr.value.value;
    } else if (t.isJSXExpressionContainer(classNameAttr.value) &&
              classNameAttr.value.expression) {
      // Handle different types of className expressions
      if (t.isMemberExpression(classNameAttr.value.expression)) {
        try {
          className = classNameAttr.value.expression.property.name;
        } catch (e) {
          // Unable to extract
        }
      } else if (t.isCallExpression(classNameAttr.value.expression) &&
                 (classNameAttr.value.expression.callee.name === 'clsx' ||
                  classNameAttr.value.expression.callee.name === 'classNames' ||
                  classNameAttr.value.expression.callee.name === 'cx')) {
        // Handle clsx, classNames, or cx
        try {
          const args = classNameAttr.value.expression.arguments;
          // Extract strings from arguments
          const classNames = [];
          args.forEach(arg => {
            if (t.isStringLiteral(arg)) {
              classNames.push(arg.value);
            } else if (t.isObjectExpression(arg)) {
              // Handle {className: true} pattern
              arg.properties.forEach(prop => {
                if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                  classNames.push(prop.key.name);
                }
              });
            }
          });
          className = classNames.join(' ');
        } catch (e) {
          // Unable to extract
        }
      } else if (t.isTemplateLiteral(classNameAttr.value.expression)) {
        // Handle template literals
        try {
          const quasis = classNameAttr.value.expression.quasis.map(q => q.value.raw);
          className = quasis.join(' ').trim();
        } catch (e) {
          // Unable to extract
        }
      } else if (t.isConditionalExpression(classNameAttr.value.expression)) {
        // Handle ternary expressions: className={isActive ? 'active' : 'inactive'}
        try {
          const consequent = classNameAttr.value.expression.consequent;
          const alternate = classNameAttr.value.expression.alternate;

          if (t.isStringLiteral(consequent)) {
            className = consequent.value;
          }
          if (t.isStringLiteral(alternate) && !className) {
            className = alternate.value;
          }
        } catch (e) {
          // Unable to extract
        }
      }
    }

    if (className) {
      // Detect and annotate framework-specific classes
      let enhancedClassName = className;

      // Add framework information if detected
      if (frameworks.tailwindCSS && isTailwindClass(className)) {
        enhancedClassName = `tailwind:${className}`;
      } else if (frameworks.bootstrap && isBootstrapClass(className)) {
        enhancedClassName = `bootstrap:${className}`;
      }

      classNameMap.set(node, enhancedClassName);
    }
  }
}