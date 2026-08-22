import React from "react";
import { Box, Typography, Button, Breadcrumbs, Link } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  backButton,
  onBack,
}) {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" variant="body2">
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                color="inherit"
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.onClick) item.onClick();
                }}
                sx={{ cursor: "pointer" }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {backButton && (
            <Button
              variant="text"
              size="small"
              onClick={onBack}
              sx={{ mb: 1, ml: -1 }}
            >
              ← Back
            </Button>
          )}
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0, ml: 2 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
