import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // 启用 standalone 输出用于 Docker
  
  // 解决 Leaflet 和其他客户端库的 SSR 问题
  // 服务器端外部化客户端专用包（适用于 Webpack 和 Turbopack）
  serverExternalPackages: ['leaflet', 'react-leaflet'],
  
  // Webpack 配置（用于非 Turbopack 构建）
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 服务器端构建时，将 leaflet 设为外部依赖，避免 SSR 错误
      config.externals = config.externals || [];
      config.externals.push({
        'leaflet': 'commonjs leaflet',
        'react-leaflet': 'commonjs react-leaflet',
      });
    }
    return config;
  },
  
  // Turbopack 配置（Next.js 15+ 新格式，替换已弃用的 experimental.turbo）
  turbopack: {
    // 明确工作区根目录，避免多 lockfile 警告
    root: path.resolve(__dirname),
    // 解析别名配置（与 tsconfig.json 保持一致）
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

export default nextConfig;
