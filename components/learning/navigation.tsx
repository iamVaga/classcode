'use client';

import type {ReactNode} from 'react';
import Link from 'next/link';
import {ArrowRight, Moon, Sun} from 'lucide-react';
import BrandMark from '@/components/brand-mark';
import {useTheme} from '@/components/theme-provider';

export default function LearningNavigation({children}: {children: ReactNode}) {
  const {theme, toggleTheme} = useTheme();
  const dark = theme === 'dark';

  return <header className="learn-header">
    <div className="learn-wrap learn-nav">
      <Link href="/" className="learn-logo"><BrandMark size={30}/> ClassCode</Link>
      <nav aria-label="Learning navigation">{children}</nav>
      <div className="learn-nav-actions">
        <button type="button" className="learn-button" onClick={toggleTheme} aria-label={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <Sun size={17}/> : <Moon size={17}/>}<span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <Link className="learn-button learn-violet" href="/?workspace=1">Open workspace <ArrowRight size={17}/></Link>
      </div>
    </div>
  </header>;
}
