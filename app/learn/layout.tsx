import type {ReactNode} from 'react';
import {JetBrains_Mono, Nunito} from 'next/font/google';
import './learn.css';

const ui = Nunito({subsets: ['latin'], variable: '--font-learn-ui', display: 'swap', preload: false});
const code = JetBrains_Mono({subsets: ['latin'], variable: '--font-learn-mono', display: 'swap', preload: false});

export default function LearningLayout({children}: {children: ReactNode}) {
  return <div className={`learn-fonts ${ui.variable} ${code.variable}`}>{children}</div>;
}
