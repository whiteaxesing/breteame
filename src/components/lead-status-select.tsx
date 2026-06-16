"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setLeadStatus } from "@/lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactStatus } from "@/lib/types";

const STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "nuevo", label: "Sin atender" },
  { value: "contactado", label: "Ya lo atendí" },
  { value: "cerrado", label: "Trabajo cerrado" },
];

export function LeadStatusSelect({
  contactId,
  status,
}: {
  contactId: string;
  status: ContactStatus;
}) {
  const [pending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(async () => {
      const res = await setLeadStatus(contactId, value as ContactStatus);
      if (!res.ok) toast.error(res.error);
      else toast.success("Estado actualizado");
    });
  }

  return (
    <Select defaultValue={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-8 w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
