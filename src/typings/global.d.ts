interface Window {
  $loadingBar?: import('naive-ui').LoadingBarProviderInst;
  $dialog?: import('naive-ui').DialogProviderInst;
  $message?: import('naive-ui').MessageProviderInst;
  $notification?: import('naive-ui').NotificationProviderInst;
}

declare module '*.svg?component' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vite-svg-loader' {
  import type { Plugin } from 'vite'
  interface ViteSvgLoaderOptions {
    defaultImport?: 'url' | 'raw' | 'component'
    svgo?: boolean
    svgoConfig?: Record<string, unknown>
    svgoPlugins?: unknown[]
  }
  export default function svgLoader(options?: ViteSvgLoaderOptions): Plugin
}
