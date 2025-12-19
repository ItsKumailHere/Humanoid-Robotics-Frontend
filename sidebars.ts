import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Chapter 1: Basics',
      items: ['chapter-1-basics/index'],
    },
    {
      type: 'category',
      label: 'Chapter 2: Physical AI',
      items: ['chapter-2-physical-ai/index'],
    },
    {
      type: 'category',
      label: 'Chapter 3: Humanoid Robotics',
      items: ['chapter-3-humanoid-robotics/index'],
    },
    {
      type: 'category',
      label: 'Chapter 4: Control Systems',
      items: ['chapter-4-control-systems/index'],
    },
    {
      type: 'category',
      label: 'Chapter 5: Advanced Topics',
      items: ['chapter-5-advanced-topics/index'],
    },
    {
      type: 'category',
      label: 'Appendices',
      items: ['license', 'docusaurus-javascript-integration'],
    },
  ],
};

export default sidebars;
