import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import "./index.css";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={AppRoutes} />
        <Notifications />
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
