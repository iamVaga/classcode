import type {Metadata} from 'next';
import PygameStudio from '@/components/pygame-studio';
import './studio.css';

export const metadata: Metadata = {
  title: 'Pygame Studio',
  description: 'Write Python, upload game assets, and play your game in the browser.',
  alternates: {canonical: '/pygame'},
};

export default function PygamePage() {
  return <PygameStudio/>;
}
