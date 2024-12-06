import { Loading } from "@components/base/Loading";
import NotFound from "@pages/NotFound";
import { Suspense, lazy } from "react";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";

// Lazily load for all app layouts and pages, to increase overall loading speed / reduce memory footprint
const DefaultLayout = lazy(() => import("../layouts/DefaultLayout/DefaultLayout"));
const BotsList = lazy(() => import("../pages/BotsList/BotsList"));
const XAccounts = lazy(() => import("../pages/XAccounts/XAccounts"));
const BotSettings = lazy(() => import("../pages/BotSettings/BotSettings"));
const BotFeatures = lazy(() => import("../pages/BotFeatures/BotFeatures"));
const BotPosts = lazy(() => import("../pages/BotPosts/BotPosts"));
const BotAirdrops = lazy(() => import("../pages/BotAirdrops/BotAirdrops"));

export const Routing = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" errorElement={<NotFound />}>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Navigate to="/bots" replace />} />
          <Route path="/bots" element={<BotsList />} />
          <Route path="/xaccounts" element={<XAccounts />} />
          <Route path="/bot/settings" element={<BotSettings />} />
          <Route path="/bot/features" element={<BotFeatures />} />
          <Route path="/bot/posts/:postId" element={<BotPosts />} />
          <Route path="/bot/posts" element={<BotPosts />} />
          <Route path="/bot/airdrops" element={<BotAirdrops />} />
        </Route>
      </Route>
    )
  );

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
