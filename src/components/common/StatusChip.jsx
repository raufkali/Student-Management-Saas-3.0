import React from "react";
import { Chip } from "@mui/material";

const statusColors = {
  active: "success",
  inactive: "default",
  pending: "warning",
  completed: "info",
  cancelled: "error",
  approved: "success",
  rejected: "error",
  graduated: "info",
  withdrawn: "warning",
  suspended: "error",
  draft: "default",
  published: "success",
  archived: "default",
  deleted: "error",
};

export default function StatusChip({
  status,
  label,
  size = "small",
  ...props
}) {
  const color = statusColors[status] || "default";
  const displayLabel =
    label || status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";

  return <Chip label={displayLabel} color={color} size={size} {...props} />;
}
