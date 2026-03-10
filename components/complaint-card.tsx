import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, AlertCircle, CheckCircle, ThumbsUp, Zap } from 'lucide-react';
import { Complaint } from '@/lib/types';
import { useState } from 'react';

export function ComplaintCard({ complaint, showVoting = false }: { complaint: Complaint; showVoting?: boolean }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState(complaint.votes);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-destructive text-destructive-foreground';
      case 'Medium':
        return 'bg-secondary text-secondary-foreground';
      case 'Low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Road: 'bg-primary/10 text-primary',
      Water: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Electricity: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Sanitation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Parks: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Utilities: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const handleVote = () => {
    if (!hasVoted) {
      setHasVoted(true);
      setVotes(votes + 1);
    }
  };

  const getRiskBadge = () => {
    if (complaint.aiRiskScore >= 80) return 'High Risk';
    if (complaint.aiRiskScore >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <Card className="overflow-hidden border-border hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground flex-1">{complaint.title}</h3>
              <span className="text-xs font-mono text-muted-foreground">{complaint.ticketId}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{complaint.description}</p>
          </div>
          <Badge className={getPriorityColor(complaint.priority)}>
            {complaint.priority}
          </Badge>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={getCategoryColor(complaint.category)}>
            {complaint.category}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {complaint.status === 'Resolved' ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {complaint.status}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {getRiskBadge()}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{complaint.location}</span>
          </div>
          {complaint.assignedEmployeeName && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Assigned:</span>
              <span>{complaint.assignedEmployeeName}</span>
            </div>
          )}
          {typeof complaint.proximityMeters === 'number' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Distance:</span>
              <span>{complaint.proximityMeters} m from issue</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{complaint.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Reward:</span>
            <span>{complaint.rewardPoints} pts</span>
          </div>
        </div>

        {showVoting && (
          <Button
            onClick={handleVote}
            disabled={hasVoted}
            variant={hasVoted ? 'secondary' : 'outline'}
            size="sm"
            className="w-full"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Support {votes > 0 && `(${votes})`}
          </Button>
        )}
      </div>
    </Card>
  );
}
