import { onRequestDelete as __api_products__id__ts_onRequestDelete } from "C:\\Users\\marti\\Desktop\\Projects\\Pharmacy\\functions\\api\\products\\[id].ts"
import { onRequestGet as __api_products__id__ts_onRequestGet } from "C:\\Users\\marti\\Desktop\\Projects\\Pharmacy\\functions\\api\\products\\[id].ts"
import { onRequestPut as __api_products__id__ts_onRequestPut } from "C:\\Users\\marti\\Desktop\\Projects\\Pharmacy\\functions\\api\\products\\[id].ts"
import { onRequestGet as __api_products_ts_onRequestGet } from "C:\\Users\\marti\\Desktop\\Projects\\Pharmacy\\functions\\api\\products.ts"
import { onRequestPost as __api_products_ts_onRequestPost } from "C:\\Users\\marti\\Desktop\\Projects\\Pharmacy\\functions\\api\\products.ts"

export const routes = [
    {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "DELETE",
      middlewares: [],
      modules: [__api_products__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products__id__ts_onRequestGet],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "PUT",
      middlewares: [],
      modules: [__api_products__id__ts_onRequestPut],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_products_ts_onRequestGet],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_products_ts_onRequestPost],
    },
  ]