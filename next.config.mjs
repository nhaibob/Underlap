// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Loại bỏ hoàn toàn alias konva, vì nó không còn cần thiết và gây lỗi
  // Nếu bạn có các cài đặt khác (ví dụ: images), hãy thêm chúng vào đây

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