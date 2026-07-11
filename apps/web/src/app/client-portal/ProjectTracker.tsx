'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const STATUS_STAGES = [
  'BOOKED',
  'PRE_PRODUCTION',
  'SHOOT',
  'EDITING',
  'REVIEW',
  'REVISION',
  'DELIVERED',
  'COMPLETED'
];

export function ProjectTracker({ projects }: { projects: any[] }) {
  if (projects.length === 0) {
    return (
      <Card padding="lg" className="border border-border bg-surface text-center">
        <p className="text-muted-foreground font-light">You have no active projects.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {projects.map((project, idx) => {
        const currentStageIdx = STATUS_STAGES.indexOf(project.status);
        const talentNames = project.bookings?.map((b: any) => `${b.talentProfile.user.firstName} ${b.talentProfile.user.lastName}`).join(', ') || 'N/A';

        return (
          <Card key={idx} padding="lg" className="border border-border bg-surface relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-xl font-serif text-foreground mb-1">
                  Project: {project.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-muted-foreground text-sm font-light">
                  Talent: {talentNames} | Date: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="px-4 py-1.5 border border-primary text-primary text-xs uppercase tracking-widest font-semibold bg-surface-elevated rounded-sm">
                {project.status.replace('_', ' ')}
              </span>
            </div>

            {/* Kanban/Tracker Progress Bar */}
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border)] -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ease-out" 
                style={{ width: `${(Math.max(currentStageIdx, 0) / (STATUS_STAGES.length - 1)) * 100}%` }}
              />

              <div className="relative z-10 flex justify-between">
                {STATUS_STAGES.map((stage, i) => {
                  const isCompleted = i <= currentStageIdx;
                  const isCurrent = i === currentStageIdx;

                  return (
                    <div key={stage} className="flex flex-col items-center group">
                      <div 
                        className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-primary border-primary shadow-[0_0_10px_var(--primary)]' 
                            : 'bg-background border-border'
                        }`}
                      >
                        {isCompleted && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      
                      {/* Tooltip on hover for small screens, always visible text on large */}
                      <span className={`mt-4 text-[10px] md:text-xs tracking-wider uppercase whitespace-nowrap hidden md:block transition-colors duration-300 ${
                        isCurrent ? 'text-primary font-semibold' : 
                        isCompleted ? 'text-foreground' : 'text-muted-foreground opacity-50'
                      }`}>
                        {stage.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-border flex gap-4">
              <Button href={`/client-portal/${project.id}`} size="sm" variant="primary">
                {project.status === 'REVIEW' ? 'Review Deliverables' : 'Open Workspace'}
              </Button>
              {project.status === 'REVIEW' && (
                <Button variant="outline" size="sm" className="hover:border-red-500 hover:text-red-500" onClick={() => alert('Revision request feature coming soon.')}>
                  Request Revision
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

