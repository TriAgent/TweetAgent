import { Loading } from "@components/base/Loading";
import NotFound from "@pages/NotFound";
import { Suspense, lazy } from "react";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";

// Lazily load for all app layouts and pages, to increase overall loading speed / reduce memory footprint
const DefaultLayout = lazy(() => import("../layouts/DefaultLayout/DefaultLayout"));
const BotsList = lazy(() => import("../pages/BotsList/BotsList"));
const BotEdit = lazy(() => import("../pages/BotEdit/BotEdit"));

export const Routing = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" errorElement={<NotFound />}>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Navigate to="/bots" replace />} />
          <Route path="/bots" element={<BotsList />}/>
          <Route path="/bots/:botId" element={<BotEdit />}/>
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
