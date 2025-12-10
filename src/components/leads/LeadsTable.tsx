import { Lead } from "@/hooks/useLeads";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const urgencyColors: Record<string, string> = {
  akut: "bg-destructive text-destructive-foreground",
  normal: "bg-secondary text-secondary-foreground",
  niedrig: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  new: "bg-primary text-primary-foreground",
  in_review: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  new: "Neu",
  in_review: "In Bearbeitung",
  completed: "Abgeschlossen",
  rejected: "Abgelehnt",
};

export function LeadsTable({ leads, onSelectLead }: LeadsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Anliegen</TableHead>
          <TableHead>Dringlichkeit</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Erstellt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow
            key={lead.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelectLead(lead)}
          >
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.phone || "-"}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {lead.concern || "-"}
            </TableCell>
            <TableCell>
              <Badge className={urgencyColors[lead.urgency || "normal"]}>
                {lead.urgency || "Normal"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={statusColors[lead.status || "new"]}>
                {statusLabels[lead.status || "new"] || lead.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(lead.created_at).toLocaleDateString("de-DE")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
