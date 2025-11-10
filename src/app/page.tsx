// src/app/page.tsx
import Link from 'next/link'; // <--- ĐÃ THÊM DÒNG NÀY
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Button } from '@/components/ui/Button';
// import { ScreenshotCard } from '@/components/ui/Card'; // Giả sử Card component đã được tạo
import { PenSquare, Users, LayoutGrid, BarChart3 } from 'lucide-react';

// Dùng placeholder cho các ảnh (vì bạn đã xóa konva)
const PlaceholderImage = () => (
    <div className="aspect-video w-full bg-background flex items-center justify-center text-text-secondary/50">
        [Ảnh chụp màn hình]
    </div>
);

// Khung chứa Card (Giả sử bạn đã tạo component Card)
const ScreenshotCardContainer = ({ title, description }: { title: string, description: string }) => (
    <div className="bg-panel border border-white/10 rounded-lg overflow-hidden">
        <PlaceholderImage />
        <div className="p-4">
            <h3 className="font-headline text-lg font-semibold">{title}</h3>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
    </div>
);


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />

      <main className="flex-1">
        
        {/* === HERO SECTION === */}
        <section className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="font-headline text-5xl md:text-6xl font-bold text-text-primary">
            UNDERLAP
          </h1>
          <p className="mt-4 text-xl text-primary font-semibold">
            Tactics, Community, Victory.
          </p>
          <p className="mt-2 text-lg text-text-secondary max-w-3xl mx-auto">
            Sa bàn chiến thuật thế hệ mới. Thiết kế sơ đồ, mô phỏng chuyển động và thảo luận chuyên sâu với cộng đồng tối giản, tập trung.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/feed">
                <Button variant="default" className="text-lg px-6 py-3 shadow-lg shadow-primary/30">
                    Bắt đầu Tạo chiến thuật
                </Button>
            </Link>
            <Button variant="ghost" className="text-lg px-6 py-3">
              Xem bản Demo
            </Button>
          </div>
        </section>

        {/* === SCREENSHOTS SECTION (3 Cards) === */}
        <section className="container mx-auto px-4 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScreenshotCardContainer
                    title="Tạo Chiến Thuật Tương Tác"
                    description="Kéo thả cầu thủ, vẽ đường cong/thẳng chi tiết với bộ công cụ chuyên nghiệp."
                />
                <ScreenshotCardContainer
                    title="Cộng Đồng Chuyên Môn"
                    description="Chia sẻ sơ đồ, nhận phản hồi và 'fork' (phát triển) chiến thuật từ HLV khác."
                />
                <ScreenshotCardContainer
                    title="Giao diện Tối Giản (Tactical)"
                    description="Phong cách Dark/Minimal, tập trung 100% vào sơ đồ và dữ liệu, không phân tâm."
                />
            </div>
        </section>

        {/* === FEATURE LIST SECTION (4 Features) === */}
        <section className="container mx-auto px-4 pb-32">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Công cụ toàn diện
            </h2>
          </div>

          {/* Lưới tính năng */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Tính năng 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-panel p-3 border border-white/10">
                <PenSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mt-4 font-headline text-xl font-semibold">Sa bàn đa năng</h3>
              <p className="mt-1 text-text-secondary">
                Công cụ kéo thả, chỉnh sửa tên/vị trí và vẽ mũi tên cong/thẳng chính xác.
              </p>
            </div>

            {/* Tính năng 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-panel p-3 border border-white/10">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="mt-4 font-headline text-xl font-semibold">Hệ thống Forks</h3>
              <p className="mt-1 text-text-secondary">
                Dễ dàng sao chép, tùy biến và đóng góp cho sơ đồ của người khác.
              </p>
            </div>

            {/* Tính năng 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-panel p-3 border border-white/10">
                <LayoutGrid className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mt-4 font-headline text-xl font-semibold">Tích hợp Chat</h3>
              <p className="mt-1 text-text-secondary">
                Quản lý đội, lên lịch và thảo luận chiến thuật trong các kênh chat chuyên biệt.
              </p>
            </div>

            {/* Tính năng 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg bg-panel p-3 border border-white/10">
                <BarChart3 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="mt-4 font-headline text-xl font-semibold">Export Dữ liệu</h3>
              <p className="mt-1 text-text-secondary">
                Xuất sơ đồ dưới dạng ảnh hoặc JSON để dễ dàng chia sẻ và lưu trữ.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}