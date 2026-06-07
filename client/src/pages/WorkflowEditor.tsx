import React, { useCallback, useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import DarkLayout from '@/components/DarkLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  Panel,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Play, ArrowLeft, Plus, Trash2 } from 'lucide-react';

// Node categories and definitions
const NODE_CATEGORIES = {
  Triggers: [
    { type: 'webhook', label: 'Webhook Trigger', color: '#f59e0b' },
    { type: 'schedule', label: 'Schedule', color: '#f59e0b' },
  ],
  AI: [
    { type: 'gemini', label: 'Gemini AI', color: '#8b5cf6' },
    { type: 'summarize', label: 'Summarize', color: '#8b5cf6' },
  ],
  Logic: [
    { type: 'condition', label: 'Condition', color: '#3b82f6' },
    { type: 'delay', label: 'Delay', color: '#3b82f6' },
  ],
  Data: [
    { type: 'transform', label: 'JSON Transform', color: '#10b981' },
    { type: 'filter', label: 'Filter', color: '#10b981' },
  ],
  Comms: [
    { type: 'telegram', label: 'Telegram', color: '#38bdf8' },
    { type: 'http', label: 'HTTP Request', color: '#ec4899' },
  ],
  Output: [
    { type: 'database', label: 'Save to DB', color: '#06b6d4' },
    { type: 'log', label: 'Log Output', color: '#06b6d4' },
  ],
};

// Simple node component
function SimpleNode({ data }: any) {
  return (
    <div className="node rounded-lg border-2 border-border bg-card p-3 shadow-lg">
      <div className="text-xs font-semibold text-foreground">{data.label}</div>
      {data.status && (
        <div className={`mt-1 text-[10px] font-medium ${
          data.status === 'running' ? 'text-info' :
          data.status === 'success' ? 'text-success' :
          data.status === 'error' ? 'text-destructive' :
          'text-muted'
        }`}>
          {data.status}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  default: SimpleNode,
};

function EditorContent() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/editor/:id');
  const workflowId = params?.id ? parseInt(params.id) : null;

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDesc, setWorkflowDesc] = useState('');

  const { screenToFlowPosition } = useReactFlow();

  // Queries
  const { data: workflow } = trpc.workflows.get.useQuery(
    { id: workflowId! },
    { enabled: !!workflowId }
  );

  const updateMutation = trpc.workflows.update.useMutation();
  const runMutation = trpc.runs.create.useMutation();

  // Load workflow data
  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setWorkflowDesc(workflow.description || '');
      
      // Load nodes and edges
      if (workflow.nodes && Array.isArray(workflow.nodes)) {
        const parsedNodes = workflow.nodes.map((n: any) => ({
          ...n,
          position: n.position || { x: 0, y: 0 },
        })) as Node[];
        setNodes(parsedNodes);
      }
      if (workflow.edges && Array.isArray(workflow.edges)) {
        const parsedEdges = workflow.edges as Edge[];
        setEdges(parsedEdges);
      }
    }
  }, [workflow, setNodes, setEdges]);

  const handleSave = async () => {
    if (!workflowId) return;
    await updateMutation.mutateAsync({
      id: workflowId,
      name: workflowName,
      description: workflowDesc,
      nodes,
      edges,
    });
  };

  const handleRun = async () => {
    if (!workflowId) return;
    await runMutation.mutateAsync({ workflowId });
  };

  const handleAddNode = (nodeType: string, label: string, color: string) => {
    const newNode: Node = {
      id: `${nodeType}_${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label, nodeType, color },
    };
    setNodes((ns: Node[]) => [...ns, newNode]);
  };

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((es: Edge[]) =>
        addEdge(
          {
            ...connection,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2, stroke: '#ff8c00' },
          },
          es
        )
      );
    },
    [setEdges]
  );

  const handleDeleteNode = (nodeId: string) => {
    setNodes((ns: Node[]) => ns.filter((n: Node) => n.id !== nodeId));
    setEdges((es: Edge[]) =>
      es.filter((e: Edge) => e.source !== nodeId && e.target !== nodeId)
    );
    setSelectedNodeId(null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('application/node');
      if (!data) return;

      const { nodeType, label, color } = JSON.parse(data);
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const newNode: Node = {
        id: `${nodeType}_${Date.now()}`,
        type: 'default',
        position,
        data: { label, nodeType, color },
      };

      setNodes((ns: Node[]) => [...ns, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left: Node Palette */}
      <div className="w-64 flex-shrink-0 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 font-semibold text-foreground">Node Palette</h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pr-4">
            {Object.entries(NODE_CATEGORIES).map(([category, nodes]) => (
              <div key={category}>
                <h4 className="mb-2 text-xs font-bold uppercase text-muted">
                  {category}
                </h4>
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData(
                          'application/node',
                          JSON.stringify(node)
                        );
                      }}
                      className="cursor-move rounded-lg border border-border bg-card p-2 text-xs font-medium text-foreground hover:bg-card/80"
                      style={{ borderLeftColor: node.color, borderLeftWidth: '3px' }}
                    >
                      {node.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3">
            <label className="text-xs font-medium text-muted">
              Workflow Name
            </label>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="mt-1"
              placeholder="Workflow name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">
              Description
            </label>
            <Textarea
              value={workflowDesc}
              onChange={(e) => setWorkflowDesc(e.target.value)}
              className="mt-1"
              placeholder="Workflow description"
              rows={2}
            />
          </div>
        </div>

        <div className="workflow-canvas flex-1 rounded-lg border border-border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255, 140, 0, 0.05)" />
            <Controls showInteractive={false} />
            <MiniMap nodeColor={(_node: any) => '#ff8c00'} />
          </ReactFlow>
        </div>
      </div>

      {/* Right: Node Config */}
      {selectedNodeId && (
        <div className="w-64 flex-shrink-0 rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Node Config</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteNode(selectedNodeId)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">
                Node ID
              </label>
              <div className="mt-1 rounded bg-input px-2 py-1 text-xs text-foreground">
                {selectedNodeId}
              </div>
            </div>
            <p className="text-xs text-muted">
              Configure this node's settings here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowEditor() {
  const [, navigate] = useLocation();

  return (
    <DarkLayout
      title="Workflow Editor"
      showToolbar={true}
      toolbarActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button className="gap-2 bg-accent hover:bg-accent/90">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button className="gap-2" variant="outline">
            <Play className="h-4 w-4" />
            Run
          </Button>
        </div>
      }
    >
      <ReactFlowProvider>
        <EditorContent />
      </ReactFlowProvider>
    </DarkLayout>
  );
}
