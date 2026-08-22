import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs, Typography, Box } from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";

export default function BreadcrumbNav({ items }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return isLast ? (
            <Typography key={index} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              color="inherit"
              onClick={(e) => {
                e.preventDefault();
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
