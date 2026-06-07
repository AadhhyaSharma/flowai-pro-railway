# FlowAI Pro - Development TODO

## Phase 1: Database & Backend
- [x] Set up workflows table (id, userId, name, description, status, nodes, edges, createdAt, updatedAt)
- [x] Set up workflow_runs table (id, workflowId, status, trigger, duration, output, createdAt)
- [x] Set up user_settings table (id, userId, geminiKey, telegramKey, settings)
- [x] Create tRPC procedures for workflow CRUD operations
- [x] Create tRPC procedures for workflow execution and run history
- [x] Create tRPC procedures for user settings management
- [x] Create database query helpers in server/db.ts

## Phase 2: UI Shell & Theming
- [x] Update client/src/index.css with dark theme colors (#1a1a2e, #16213e, orange, purple accents)
- [x] Create DarkLayout component with sidebar navigation and top toolbar
- [x] Implement sidebar navigation with menu items (Dashboard, Editor, History, Settings)
- [x] Create top toolbar component with workflow name and status display
- [x] Set up responsive layout with collapsible sidebar for mobile
- [ ] Implement keyboard shortcuts (e.g., Cmd+S to save, Cmd+K for command palette)

## Phase 3: Dashboard Page
- [x] Create dashboard page component (client/src/pages/Dashboard.tsx)
- [x] Implement workflow list with cards showing name, status badge, last run time
- [x] Add status badge component (active/inactive states)
- [x] Implement quick-action buttons (Edit, Run, Delete) on each workflow card
- [x] Add "Create New Workflow" button with modal dialog
- [x] Implement workflow deletion with confirmation dialog
- [x] Add empty-state illustration for zero workflows

## Phase 4: Visual Workflow Editor
- [x] Create editor page component (client/src/pages/WorkflowEditor.tsx)
- [x] Integrate React Flow canvas with dot-grid background
- [x] Implement node palette panel (left sidebar) with categorized nodes
- [x] Create node categories: Triggers, AI, Logic, Data, Comms, Output
- [x] Implement drag-and-drop node creation from palette to canvas
- [x] Add top toolbar with Save, Run, and Back buttons
- [x] Implement node connection logic (edges between nodes)
- [x] Add node deletion and selection handling

## Phase 5: Node Configuration & Execution
- [x] Create node configuration panel component (right sidebar)
- [ ] Implement form-based config editor for each node type
- [ ] Add field inputs specific to each node type (text, select, toggle, etc.)
- [ ] Create execution run panel component showing per-node status
- [ ] Implement real-time status display (idle, running, success, error)
- [ ] Add log output display in run panel
- [x] Implement workflow execution trigger from editor

## Phase 6: Execution History & Settings
- [x] Create execution history page (client/src/pages/ExecutionHistory.tsx)
- [x] Implement table showing past workflow runs with status, trigger, duration, timestamp
- [ ] Add filtering and sorting for execution history
- [x] Create settings page (client/src/pages/Settings.tsx)
- [x] Implement API key management form (Gemini, Telegram, etc.)
- [ ] Add general app preferences settings
- [x] Implement settings persistence via tRPC

## Phase 7: Auth Pages
- [ ] Style login page to match dark theme
- [ ] Style register page to match dark theme
- [ ] Style reset password page to match dark theme
- [ ] Ensure consistent branding and color palette across all auth pages
- [ ] Add form validation and error handling

## Phase 8: Polish & Responsive Design
- [ ] Test responsive layout on mobile, tablet, desktop
- [ ] Implement collapsible sidebar for mobile views
- [ ] Add empty-state illustrations for zero-run state
- [ ] Ensure all icons and visual elements match n8n aesthetic
- [ ] Test keyboard navigation and accessibility
- [ ] Add loading states and skeleton loaders

## Phase 9: Testing
- [ ] Write vitest tests for workflow CRUD operations
- [ ] Write vitest tests for execution history queries
- [ ] Write vitest tests for settings management
- [ ] Write vitest tests for node configuration validation
- [ ] Run full test suite and verify coverage

## Phase 10: Deployment Setup
- [ ] Configure persistent computing environment (read skill)
- [ ] Set up auto-restart and health checks
- [ ] Prepare environment variables for production
- [ ] Test deployment on persistent VM

## Phase 11: Launcher & Status Checker
- [ ] Build standalone EXE launcher (no dependencies)
- [ ] Build CMD status checker script
- [ ] Ensure both tools work independently

## Phase 12: Final Delivery
- [ ] Create checkpoint with all features complete
- [ ] Provide public URL to user
- [ ] Deliver EXE launcher file
- [ ] Deliver CMD status checker file
- [ ] Document usage instructions
