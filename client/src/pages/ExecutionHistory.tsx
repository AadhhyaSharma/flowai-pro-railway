import React from 'react';
import { trpc } from '@/lib/trpc';
import DarkLayout from '@/components/DarkLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { History } from 'lucide-react';

export default function ExecutionHistory() {
  const { data: workflows = [], isLoading } = trpc.workflows.list.useQuery();

  return (
    <DarkLayout
      title="Execution History"
      subtitle="View past workflow runs"
    >
      <div className="p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent" />
              <p className="text-sm text-muted">Loading history...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground">Workflow</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Trigger</TableHead>
                  <TableHead className="text-foreground">Duration</TableHead>
                  <TableHead className="text-foreground">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <History className="mb-2 h-8 w-8 text-muted/50" />
                        <p className="text-sm text-muted">No execution history yet</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((workflow) => (
                    <TableRow key={workflow.id} className="border-border hover:bg-card/50">
                      <TableCell className="font-medium text-foreground">{workflow.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          workflow.status === 'active'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted/10 text-muted'
                        }`}>
                          {workflow.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted">manual</TableCell>
                      <TableCell className="text-muted">—</TableCell>
                      <TableCell className="text-muted text-sm">
                        {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DarkLayout>
  );
}
