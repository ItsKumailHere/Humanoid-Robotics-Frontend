# Best Practices for Integrating JavaScript Components into Docusaurus Websites

## 1. Docusaurus Version and Plugin Architecture

### Current Docusaurus Version
- The project uses Docusaurus 3.9.2, which is a modern static-site generator built with React
- Docusaurus follows a modular architecture with plugins and themes
- Plugin architecture allows for extensibility while maintaining performance

### Plugin Architecture Overview
- **Plugins**: Provide modular functionality to extend Docusaurus sites
- **Themes**: Special plugins focused on UI components and rendering
- **Presets**: Collections of plugins and themes that work together
- **Lifecycle Methods**: Plugins follow specific lifecycle methods for content loading and rendering

### Key Architecture Concepts
- Server-side rendering (SSR) during build time
- Client-side rendering (CSR) for interactive features
- Component swizzling for customization
- Theme aliases (@theme, @theme-original, @theme-init)

## 2. Best Practices for Adding JavaScript to All Pages

### Client Modules Approach
Client modules are the recommended way to add JavaScript that runs on all pages:

```javascript
// docusaurus.config.js
module.exports = {
  clientModules: [
    require.resolve('./src/mySiteGlobalJs.js'),
  ],
};
```

### Available Methods
1. **Client Modules**: For global JavaScript that runs on every page
2. **Layout Wrapping**: Using theme swizzling to wrap layout components
3. **Component Injection**: Adding components to global layouts

### Client Module Lifecycle Functions
```javascript
// myClientModule.js
export function onRouteDidUpdate({location, previousLocation}) {
  // Called when a new route is rendered
}

export function onRouteUpdate({location, previousLocation}) {
  // Called when router preloads next route's assets
}
```

## 3. Recommended Approaches for Floating UI Components

### Using Theme Swizzling
The recommended approach is to use theme swizzling to wrap existing components:

```bash
npm run swizzle @docusaurus/theme-classic Footer -- --wrap
```

This creates a wrapper component that allows you to inject UI elements across all pages.

### Positioning Techniques
- Use `position: fixed` for floating elements
- Set appropriate `z-index` to ensure visibility
- Consider responsive design for different screen sizes
- Use CSS transforms for hover effects

### Example Floating Component Structure
```tsx
const FloatingComponent: React.FC = () => {
  return (
    <BrowserOnly fallback={<div style={{ display: 'none' }} />}>
      {() => (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            // Additional styling
          }}
        >
          {/* Component content */}
        </div>
      )}
    </BrowserOnly>
  );
};
```

## 4. Static Hosting Compatibility Considerations

### Server-Side Rendering (SSR) vs Client-Side Rendering (CSR)
- Docusaurus renders themes twice: once for SSR and once for CSR
- Components accessing browser globals like `window` will fail during SSR
- Use escape hatches for browser-dependent functionality

### Escape Hatches for Browser-Only Code

1. **BrowserOnly Component**:
```tsx
import BrowserOnly from '@docusaurus/BrowserOnly';

<BrowserOnly fallback={<div>Loading...</div>}>
  {() => {
    // Browser-only code here
    return <Component />;
  }}
</BrowserOnly>
```

2. **useIsBrowser Hook**:
```tsx
import useIsBrowser from '@docusaurus/useIsBrowser';
const isBrowser = useIsBrowser();
```

3. **useEffect Hook**:
```tsx
useEffect(() => {
  // Runs only in browser after first render
}, []);
```

4. **ExecutionEnvironment**:
```tsx
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  // Browser-only code
}
```

### Static Hosting Benefits
- Docusaurus generates static HTML, CSS, and JavaScript files
- Fully compatible with static hosting platforms (Netlify, Vercel, GitHub Pages)
- Fast loading times and excellent SEO
- No server-side dependencies for serving content

## 5. How to Add a Floating Chat Button to All Pages in Bottom-Right Corner

### Step-by-Step Implementation

1. **Create the Chat Component**:
   - Create a new component in `src/components/FloatingChat/`
   - Implement the UI with proper state management
   - Use `BrowserOnly` to handle SSR compatibility

2. **Implement Theme Swizzling**:
   - Use `docusaurus swizzle @docusaurus/theme-classic Footer --wrap`
   - This creates `src/theme/Footer/index.js` to wrap the original Footer

3. **Integrate the Component**:
   - Import and render the floating chat button in the wrapper component

### Example Implementation

**FloatingChatButton.tsx**:
```tsx
import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const FloatingChatButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{id: number; text: string; sender: 'user' | 'bot'}[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user' as const
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: `I received your message: "${inputValue}". This is a demo chat interface.`,
        sender: 'bot' as const
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <BrowserOnly fallback={<div style={{ display: 'none' }} />}>
      {() => (
        <>
          {/* Chat Window - Rendered when open */}
          {isChatOpen && (
            <div style={{/* Chat window styles */}}>
              {/* Chat header, messages, and input */}
            </div>
          )}
          
          {/* Floating Chat Button */}
          <div
            onClick={handleChatToggle}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              cursor: 'pointer',
              backgroundColor: '#007cba',
              color: 'white',
              padding: '15px',
              borderRadius: '50%',
              fontSize: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
            }}
            title="Open Chat"
            aria-label="Open Chat"
          >
            {isChatOpen ? '×' : '💬'}
          </div>
        </>
      )}
    </BrowserOnly>
  );
};

export default FloatingChatButton;
```

**Footer Wrapper (src/theme/Footer/index.js)**:
```js
import React from 'react';
import Footer from '@theme-original/Footer';
import FloatingChatButton from '@site/src/components/FloatingChat';

export default function FooterWrapper(props) {
  return (
    <>
      <FloatingChatButton />
      <Footer {...props} />
    </>
  );
}
```

### Positioning Considerations
- Fixed position with `bottom: 20px` and `right: 20px`
- High z-index to appear above other content
- Proper spacing from edges of the screen
- Consider other floating elements to avoid overlap
- Responsive design for mobile devices

### Accessibility Considerations
- Add proper ARIA labels
- Ensure keyboard navigability
- Provide clear visual feedback on interactions
- Consider contrast ratios for accessibility

### Performance Considerations
- Keep components lightweight
- Use efficient state management
- Minimize unnecessary re-renders
- Consider lazy loading for complex components

This implementation provides a floating chat button that appears on all pages in the bottom-right corner, with a toggleable chat interface that follows Docusaurus best practices for static hosting compatibility.