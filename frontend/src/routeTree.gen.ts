/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// This file is manually maintained to match the project routes.

import { Route as rootRouteImport } from './routes/__root'
import { Route as SignupRouteImport } from './routes/signup'
import { Route as ResetPasswordRouteImport } from './routes/reset-password'
import { Route as RecoverPasswordRouteImport } from './routes/recover-password'
import { Route as LoginRouteImport } from './routes/login'
import { Route as LayoutRouteImport } from './routes/_layout'
import { Route as LayoutIndexRouteImport } from './routes/_layout/index'
import { Route as LayoutVentasRouteImport } from './routes/_layout/ventas'
import { Route as LayoutStockRouteImport } from './routes/_layout/stock'
import { Route as LayoutSettingsRouteImport } from './routes/_layout/settings'
import { Route as LayoutReportesRouteImport } from './routes/_layout/reportes'
import { Route as LayoutItemsRouteImport } from './routes/_layout/items'
import { Route as LayoutClientesRouteImport } from './routes/_layout/clientes'
import { Route as LayoutAdminRouteImport } from './routes/_layout/admin'
import { Route as LayoutAsistenteRouteImport } from './routes/_layout/asistente'

const SignupRoute = SignupRouteImport.update({ id: '/signup', path: '/signup', getParentRoute: () => rootRouteImport } as any)
const ResetPasswordRoute = ResetPasswordRouteImport.update({ id: '/reset-password', path: '/reset-password', getParentRoute: () => rootRouteImport } as any)
const RecoverPasswordRoute = RecoverPasswordRouteImport.update({ id: '/recover-password', path: '/recover-password', getParentRoute: () => rootRouteImport } as any)
const LoginRoute = LoginRouteImport.update({ id: '/login', path: '/login', getParentRoute: () => rootRouteImport } as any)
const LayoutRoute = LayoutRouteImport.update({ id: '/_layout', getParentRoute: () => rootRouteImport } as any)
const LayoutIndexRoute = LayoutIndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => LayoutRoute } as any)
const LayoutVentasRoute = LayoutVentasRouteImport.update({ id: '/ventas', path: '/ventas', getParentRoute: () => LayoutRoute } as any)
const LayoutStockRoute = LayoutStockRouteImport.update({ id: '/stock', path: '/stock', getParentRoute: () => LayoutRoute } as any)
const LayoutSettingsRoute = LayoutSettingsRouteImport.update({ id: '/settings', path: '/settings', getParentRoute: () => LayoutRoute } as any)
const LayoutReportesRoute = LayoutReportesRouteImport.update({ id: '/reportes', path: '/reportes', getParentRoute: () => LayoutRoute } as any)
const LayoutItemsRoute = LayoutItemsRouteImport.update({ id: '/items', path: '/items', getParentRoute: () => LayoutRoute } as any)
const LayoutClientesRoute = LayoutClientesRouteImport.update({ id: '/clientes', path: '/clientes', getParentRoute: () => LayoutRoute } as any)
const LayoutAdminRoute = LayoutAdminRouteImport.update({ id: '/admin', path: '/admin', getParentRoute: () => LayoutRoute } as any)
const LayoutAsistenteRoute = LayoutAsistenteRouteImport.update({ id: '/asistente', path: '/asistente', getParentRoute: () => LayoutRoute } as any)

export interface FileRoutesByFullPath {
  '/': typeof LayoutIndexRoute
  '/login': typeof LoginRoute
  '/recover-password': typeof RecoverPasswordRoute
  '/reset-password': typeof ResetPasswordRoute
  '/signup': typeof SignupRoute
  '/admin': typeof LayoutAdminRoute
  '/asistente': typeof LayoutAsistenteRoute
  '/clientes': typeof LayoutClientesRoute
  '/items': typeof LayoutItemsRoute
  '/reportes': typeof LayoutReportesRoute
  '/settings': typeof LayoutSettingsRoute
  '/stock': typeof LayoutStockRoute
  '/ventas': typeof LayoutVentasRoute
}
export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/recover-password': typeof RecoverPasswordRoute
  '/reset-password': typeof ResetPasswordRoute
  '/signup': typeof SignupRoute
  '/admin': typeof LayoutAdminRoute
  '/asistente': typeof LayoutAsistenteRoute
  '/clientes': typeof LayoutClientesRoute
  '/items': typeof LayoutItemsRoute
  '/reportes': typeof LayoutReportesRoute
  '/settings': typeof LayoutSettingsRoute
  '/stock': typeof LayoutStockRoute
  '/ventas': typeof LayoutVentasRoute
  '/': typeof LayoutIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/_layout': typeof LayoutRouteWithChildren
  '/login': typeof LoginRoute
  '/recover-password': typeof RecoverPasswordRoute
  '/reset-password': typeof ResetPasswordRoute
  '/signup': typeof SignupRoute
  '/_layout/admin': typeof LayoutAdminRoute
  '/_layout/asistente': typeof LayoutAsistenteRoute
  '/_layout/clientes': typeof LayoutClientesRoute
  '/_layout/items': typeof LayoutItemsRoute
  '/_layout/reportes': typeof LayoutReportesRoute
  '/_layout/settings': typeof LayoutSettingsRoute
  '/_layout/stock': typeof LayoutStockRoute
  '/_layout/ventas': typeof LayoutVentasRoute
  '/_layout/': typeof LayoutIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/login' | '/recover-password' | '/reset-password' | '/signup' | '/admin' | '/asistente' | '/clientes' | '/items' | '/reportes' | '/settings' | '/stock' | '/ventas'
  fileRoutesByTo: FileRoutesByTo
  to: '/login' | '/recover-password' | '/reset-password' | '/signup' | '/admin' | '/asistente' | '/clientes' | '/items' | '/reportes' | '/settings' | '/stock' | '/ventas' | '/'
  id: '__root__' | '/_layout' | '/login' | '/recover-password' | '/reset-password' | '/signup' | '/_layout/admin' | '/_layout/asistente' | '/_layout/clientes' | '/_layout/items' | '/_layout/reportes' | '/_layout/settings' | '/_layout/stock' | '/_layout/ventas' | '/_layout/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  LayoutRoute: typeof LayoutRouteWithChildren
  LoginRoute: typeof LoginRoute
  RecoverPasswordRoute: typeof RecoverPasswordRoute
  ResetPasswordRoute: typeof ResetPasswordRoute
  SignupRoute: typeof SignupRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/signup': { id: '/signup'; path: '/signup'; fullPath: '/signup'; preLoaderRoute: typeof SignupRouteImport; parentRoute: typeof rootRouteImport }
    '/reset-password': { id: '/reset-password'; path: '/reset-password'; fullPath: '/reset-password'; preLoaderRoute: typeof ResetPasswordRouteImport; parentRoute: typeof rootRouteImport }
    '/recover-password': { id: '/recover-password'; path: '/recover-password'; fullPath: '/recover-password'; preLoaderRoute: typeof RecoverPasswordRouteImport; parentRoute: typeof rootRouteImport }
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/_layout': { id: '/_layout'; path: ''; fullPath: '/'; preLoaderRoute: typeof LayoutRouteImport; parentRoute: typeof rootRouteImport }
    '/_layout/': { id: '/_layout/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof LayoutIndexRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/ventas': { id: '/_layout/ventas'; path: '/ventas'; fullPath: '/ventas'; preLoaderRoute: typeof LayoutVentasRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/stock': { id: '/_layout/stock'; path: '/stock'; fullPath: '/stock'; preLoaderRoute: typeof LayoutStockRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/settings': { id: '/_layout/settings'; path: '/settings'; fullPath: '/settings'; preLoaderRoute: typeof LayoutSettingsRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/reportes': { id: '/_layout/reportes'; path: '/reportes'; fullPath: '/reportes'; preLoaderRoute: typeof LayoutReportesRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/items': { id: '/_layout/items'; path: '/items'; fullPath: '/items'; preLoaderRoute: typeof LayoutItemsRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/clientes': { id: '/_layout/clientes'; path: '/clientes'; fullPath: '/clientes'; preLoaderRoute: typeof LayoutClientesRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/admin': { id: '/_layout/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof LayoutAdminRouteImport; parentRoute: typeof LayoutRoute }
    '/_layout/asistente': { id: '/_layout/asistente'; path: '/asistente'; fullPath: '/asistente'; preLoaderRoute: typeof LayoutAsistenteRouteImport; parentRoute: typeof LayoutRoute }
  }
}

interface LayoutRouteChildren {
  LayoutAdminRoute: typeof LayoutAdminRoute
  LayoutAsistenteRoute: typeof LayoutAsistenteRoute
  LayoutClientesRoute: typeof LayoutClientesRoute
  LayoutItemsRoute: typeof LayoutItemsRoute
  LayoutReportesRoute: typeof LayoutReportesRoute
  LayoutSettingsRoute: typeof LayoutSettingsRoute
  LayoutStockRoute: typeof LayoutStockRoute
  LayoutVentasRoute: typeof LayoutVentasRoute
  LayoutIndexRoute: typeof LayoutIndexRoute
}

const LayoutRouteChildren: LayoutRouteChildren = {
  LayoutAdminRoute,
  LayoutAsistenteRoute,
  LayoutClientesRoute,
  LayoutItemsRoute,
  LayoutReportesRoute,
  LayoutSettingsRoute,
  LayoutStockRoute,
  LayoutVentasRoute,
  LayoutIndexRoute,
}

const LayoutRouteWithChildren = LayoutRoute._addFileChildren(LayoutRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  LayoutRoute: LayoutRouteWithChildren,
  LoginRoute,
  RecoverPasswordRoute,
  ResetPasswordRoute,
  SignupRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
