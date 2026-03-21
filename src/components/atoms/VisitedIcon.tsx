"use client";

import * as React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";

interface VisitedIconProps {
  year: string;
  month: string;
  day: string;
  slug: string;
  newsCounter?: number;
}

export default function VisitedIcon({
  year,
  month,
  day,
  slug,
  newsCounter,
}: VisitedIconProps) {
  const [visited, setVisited] = React.useState(false);
  const [updated, setUpdated] = React.useState(false);

  React.useEffect(() => {
    const visitedKey = "visited_posts";
    const visitedPosts = JSON.parse(
      localStorage.getItem(visitedKey) || "{}",
    ) as Record<string, number>;
    const currentPostId = `${year}/${month}/${day}/${slug}` as string;
    if (visitedPosts.hasOwnProperty(currentPostId)) {
      setVisited(true);
      setUpdated(visitedPosts[currentPostId] === newsCounter);
    }
  }, [year, month, day, slug, newsCounter]);

  if (!visited) return null;

  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", verticalAlign: "middle", ml: 1 }}
    >
      <CheckCircleIcon
        fontSize="small"
        color={!updated ? "success" : "warning"}
      />
    </Box>
  );
}
