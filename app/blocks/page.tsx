import type {Metadata} from 'next';
import BlockStudio from '@/components/block-studio';
import './studio.css';

export const metadata: Metadata = {
  title: 'PyBlock',
  description: 'Snap together Python blocks and draw with Turtle.',
  alternates: {canonical: '/blocks'},
};

export default function BlocksPage() {
  return <BlockStudio/>;
}
