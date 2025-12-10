// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { Button } from '@/components/ui/Button';
import { 
  PenSquare, 
  Users, 
  LayoutGrid, 
  BarChart3, 
  ArrowRight, 
  Play,
  Sparkles,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

// Feature Card Component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color = 'primary' 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color?: 'primary' | 'secondary';
}) => (
  <div className="group relative p-6 rounded-2xl bg-card/50 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
    {/* Gradient Background on Hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="relative">
      <div className={`inline-flex p-3 rounded-xl ${color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'} mb-4`}>
        <Icon className={`w-6 h-6 ${color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
      </div>
      <h3 className="font-headline text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

// Screenshot Card Component
const ScreenshotCard = ({ 
  image, 
  title, 
  description 
}: { 
  image: string; 
  title: string; 
  description: string;
}) => (
  <div className="group relative rounded-2xl overflow-hidden bg-card border border-white/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
    {/* Image Container */}
    <div className="relative aspect-video overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
    </div>
    
    {/* Content */}
    <div className="p-5">
      <h3 className="font-headline text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

// Stat Item
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {value}
    </p>
    <p className="text-muted-foreground mt-1">{label}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <LandingHeader />

      <main className="flex-1 relative z-10">
        
        {/* === HERO SECTION === */}
        <section className="container mx-auto px-4 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Phiên bản Beta - Miễn phí trọn đời</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground mb-4">
            Thiết kế chiến thuật
            <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              như một Pro
            </span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sa bàn chiến thuật thế hệ mới. Thiết kế sơ đồ, mô phỏng chuyển động và thảo luận chuyên sâu với cộng đồng HLV toàn cầu.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/feed">
              <Button 
                variant="default" 
                className="text-lg px-8 py-6 h-auto shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-primary/80 hover:shadow-2xl hover:shadow-primary/30 transition-all group"
              >
                Bắt đầu miễn phí
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-6 h-auto bg-card/50 border-white/10 hover:bg-white/5 group"
            >
              <Play className="w-5 h-5 mr-2" />
              Xem Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
                ))}
              </div>
              <span>500+ HLV đang sử dụng</span>
            </div>
          </div>
        </section>

        {/* === STATS SECTION === */}
        <section className="container mx-auto px-4 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-card/30 border border-white/10">
            <StatItem value="500+" label="Huấn luyện viên" />
            <StatItem value="2,000+" label="Chiến thuật" />
            <StatItem value="10K+" label="Lượt tương tác" />
            <StatItem value="99%" label="Hài lòng" />
          </div>
        </section>

        {/* === SCREENSHOTS SECTION === */}
        <section className="container mx-auto px-4 pb-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mọi thứ bạn cần
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Từ việc tạo chiến thuật đến chia sẻ với cộng đồng, tất cả trong một nền tảng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScreenshotCard
              image="/assets/images/landing/tactic-board.png"
              title="Tạo Chiến Thuật Tương Tác"
              description="Kéo thả cầu thủ, vẽ đường cong/thẳng chi tiết với bộ công cụ chuyên nghiệp."
            />
            <ScreenshotCard
              image="/assets/images/landing/community-feed.png"
              title="Cộng Đồng Chuyên Môn"
              description="Chia sẻ sơ đồ, nhận phản hồi và 'fork' chiến thuật từ HLV khác."
            />
            <ScreenshotCard
              image="/assets/images/landing/dark-interface.png"
              title="Giao diện Tối Giản"
              description="Phong cách Dark/Minimal, tập trung 100% vào sơ đồ và dữ liệu."
            />
          </div>
        </section>

        {/* === FEATURES SECTION === */}
        <section className="container mx-auto px-4 pb-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
              Công cụ mạnh mẽ
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Được thiết kế dành riêng cho huấn luyện viên và người yêu chiến thuật bóng đá.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={PenSquare}
              title="Sa bàn đa năng"
              description="Công cụ kéo thả, chỉnh sửa tên/vị trí và vẽ mũi tên cong/thẳng chính xác."
              color="primary"
            />
            <FeatureCard
              icon={Users}
              title="Hệ thống Forks"
              description="Dễ dàng sao chép, tùy biến và đóng góp cho sơ đồ của người khác."
              color="secondary"
            />
            <FeatureCard
              icon={LayoutGrid}
              title="Tích hợp Chat"
              description="Quản lý đội, lên lịch và thảo luận chiến thuật trong các kênh chuyên biệt."
              color="primary"
            />
            <FeatureCard
              icon={BarChart3}
              title="Export Dữ liệu"
              description="Xuất sơ đồ dưới dạng ảnh hoặc JSON để dễ dàng chia sẻ và lưu trữ."
              color="secondary"
            />
          </div>
        </section>

        {/* === WHY CHOOSE US === */}
        <section className="container mx-auto px-4 pb-24">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Tại sao chọn Underlap?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Nhanh và mượt mà</h4>
                      <p className="text-muted-foreground">Giao diện được tối ưu, phản hồi tức thì.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Bảo mật dữ liệu</h4>
                      <p className="text-muted-foreground">Chiến thuật của bạn được bảo vệ an toàn.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Cộng đồng toàn cầu</h4>
                      <p className="text-muted-foreground">Kết nối với HLV từ khắp nơi trên thế giới.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-headline text-6xl font-bold text-foreground">100%</p>
                    <p className="text-muted-foreground mt-2">Miễn phí</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === CTA SECTION === */}
        <section className="container mx-auto px-4 pb-24">
          <div className="text-center py-16 px-8 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border border-white/10">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sẵn sàng nâng tầm chiến thuật?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Tham gia cùng hàng trăm huấn luyện viên đang sử dụng Underlap để thiết kế chiến thuật chuyên nghiệp.
            </p>
            <Link href="/register">
              <Button 
                variant="default" 
                className="text-lg px-10 py-6 h-auto shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-secondary hover:shadow-primary/40 transition-all group"
              >
                Đăng ký miễn phí ngay
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* === FOOTER === */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-headline text-xl font-bold text-foreground">Underlap</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Underlap. Tactics, Community, Victory.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Điều khoản</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Bảo mật</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Liên hệ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}