// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {

  // === THÊM KHỐI NÀY ĐỂ TẮT ESLINT KHI BUILD ===
  eslint: {
    // Cảnh báo: Điều này sẽ bỏ qua lỗi linting khi build.
    ignoreDuringBuilds: true,
  },
  // ===========================================

  // === TẮT CACHE MỨC ĐỘ SERVER COMPONENT ===
  async headers() {
    return [
      {
        // Áp dụng cho tất cả các đường dẫn
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0', // Tắt cache browser
          },
        ],
      },
    ];
  },
  
  // Xóa khối webpack alias cũ (nó không còn cần thiết)
  webpack: (config) => {
    // Xóa alias konva
    if (config.resolve.alias) {
        delete config.resolve.alias['konva'];
    }
    return config;
  },
};

export default nextConfig;