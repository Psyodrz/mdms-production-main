import FlowingMenu from "@/components/motion/FlowingMenu";

export default function FlowingMenuDemo() {
  const demoItems = [
    { link: '#', text: 'Mojave', image: 'https://picsum.photos/600/400?random=1' },
    { link: '#', text: 'Sonoma', image: 'https://picsum.photos/600/400?random=2' },
    { link: '#', text: 'Monterey', image: 'https://picsum.photos/600/400?random=3' },
    { link: '#', text: 'Sequoia', image: 'https://picsum.photos/600/400?random=4' }
  ];

  return (
    <div className="min-h-screen bg-[#120F17] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[600px] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <FlowingMenu items={demoItems} />
      </div>
    </div>
  );
}
