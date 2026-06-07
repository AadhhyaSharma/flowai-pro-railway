import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import DarkLayout from '@/components/DarkLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Play, Trash2, Edit2, Zap, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Queries
  const { data: workflows = [], isLoading, refetch } = trpc.workflows.list.useQuery();
  const createMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      refetch();
    },
  });
  const deleteMutation = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      setDeleteId(null);
      refetch();
    },
  });
  const runMutation = trpc.runs.create.useMutation();

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName, description: newDesc });
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
  };

  const handleRun = async (workflowId: number) => {
    await runMutation.mutateAsync({ workflowId });
  };

  return (
    <DarkLayout
      title="Workflows"
      subtitle={`${workflows.length} workflow${workflows.length !== 1 ? 's' : ''}`}
      toolbarActions={
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Workflow Name</label>
                <Input
                  placeholder="e.g., Send Email on Webhook"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                <Textarea
                  placeholder="Describe what this workflow does..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
              <p className="text-sm text-muted">Loading workflows...</p>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
            <Zap className="mb-4 h-12 w-12 text-muted/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No workflows yet</h3>
            <p className="mb-6 text-sm text-muted">Create your first workflow to get started</p>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Workflow Name</label>
                    <Input
                      placeholder="e.g., Send Email on Webhook"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Description (optional)</label>
                    <Textarea
                      placeholder="Describe what this workflow does..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-accent hover:bg-accent/90"
                      onClick={handleCreate}
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="card group flex flex-col">
                <div className="mb-4 flex-1">
                  <h3 className="mb-1 font-semibold text-foreground line-clamp-2">{workflow.name}</h3>
                  {workflow.description && (
                    <p className="mb-3 text-xs text-muted line-clamp-2">{workflow.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        workflow.status === 'active' ? 'bg-success' : 'bg-muted'
                      }`}
                    />
                    <span className={`text-xs font-medium ${
                      workflow.status === 'active' ? 'text-success' : 'text-muted'
                    }`}>
                      {workflow.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-xs text-muted">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/editor/${workflow.id}`)}
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRun(workflow.id)}
                    className="flex-1 gap-1"
                    disabled={runMutation.isPending}
                  >
                    <Play className="h-3 w-3" />
                    Run
                  </Button>
                  <AlertDialog open={deleteId === workflow.id} onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                  }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(workflow.id)}
                      className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                    <AlertDialogContent className="border-border bg-card">
                      <AlertDialogTitle className="text-foreground">Delete Workflow?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted">
                        This action cannot be undone. The workflow "{workflow.name}" will be permanently deleted.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(workflow.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DarkLayout>
  );
}
