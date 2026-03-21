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
    const currentPostId = `${year}/${month}/${day}/${slug}`;

    let visitedPosts: Record<string, number> = {};

    try {
      const parsedData = JSON.parse(localStorage.getItem(visitedKey) || "{}");

      if (Array.isArray(parsedData)) {
        parsedData.forEach((postId) => {
          if (typeof postId === "string") {
            visitedPosts[postId] = -1;
          }
        });
      } else if (parsedData !== null && typeof parsedData === "object") {
        visitedPosts = parsedData as Record<string, number>;
      }
    } catch (error) {
      console.error("Failed to parse visited_posts in useEffect:", error);
    }

    const postCounter = visitedPosts[currentPostId];

    if (postCounter !== undefined) {
      setVisited(true);
      setUpdated(postCounter !== newsCounter);
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
