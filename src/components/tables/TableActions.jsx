import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from "@mui/icons-material";

export default function TableActions({
  onView,
  onEdit,
  onDelete,
  onDownload,
  onPrint,
  viewTooltip = "View",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
  downloadTooltip = "Download",
  printTooltip = "Print",
}) {
  return (
    <>
      {onView && (
        <Tooltip title={viewTooltip}>
          <IconButton size="small" onClick={onView}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title={editTooltip}>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDownload && (
        <Tooltip title={downloadTooltip}>
          <IconButton size="small" onClick={onDownload}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onPrint && (
        <Tooltip title={printTooltip}>
          <IconButton size="small" onClick={onPrint}>
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
