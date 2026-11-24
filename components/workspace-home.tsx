'use client';

import {useDeferredValue, useEffect, useState} from 'react';
import {ArrowRight, BookOpen, Code2, FolderCode, Globe, Moon, Plus, Search, Sun} from 'lucide-react';
import Link from 'next/link';
import type {Project} from '@/lib/model';
import AccessibilityMenu from './accessibility-menu';
import Avatar, {buddyNames} from './avatar';
import BrandMark from './brand-mark';
import ClassroomPanel from './classroom-panel';

const workspacePages = {
  Projects: 'My projects',
  'My students': 'Classroom',
  'Lesson notes': 'Lesson notes',
} as const;
export type WorkspacePage = keyof typeof workspacePages;

type Props = {
  page: WorkspacePage;
  onPage: (page: WorkspacePage) => void;
  onHome: () => void;
  projects: Project[];
  onOpen: (project: Project) => void;
  onModal: (mode: string) => void;
  avatar: number;
  color: string;
  user: string;
  dark: boolean;
  onTheme: () => void;
};

const languages = {python: 'Python', java: 'Java', cpp: 'C++', c: 'C', web: 'Web development'} as const;
const categories = ['All projects', 'Python', 'Turtle graphics', 'Web development', 'Java', 'C++', 'C'];

function projectLanguage(project: Project) {
  if (project.type === 'python' && Object.values(project.files).some(code => /\b(?:import turtle|from turtle import)\b/.test(code))) {
    return 'Turtle graphics';
  }
  return languages[project.type];
}

export default function WorkspaceHome({page, onPage, onHome, projects, onOpen, onModal, avatar, color, user, dark, onTheme}: Props) {
  return <div className="lp workspace-library">
    <header className="lp-nav workspace-nav">
      <div className="lp-wrap lp-nav-inner">
        <button type="button" className="lp-logo" aria-label="ClassCode home" onClick={onHome}><BrandMark size={31}/>ClassCode</button>
        <nav aria-label="Workspace navigation">
          {(Object.keys(workspacePages) as WorkspacePage[]).map(key =>
            <button key={key} aria-current={page === key ? 'page' : undefined} onClick={() => onPage(key)}>{workspacePages[key]}</button>
          )}
          <Link href="/learn">Learn</Link>
        </nav>
        <div className="lp-nav-actions">
          <Link className="lp-button lp-quiet" href="/session">Join session</Link>
          <AccessibilityMenu/>
          <button className="lp-button lp-theme-toggle" aria-label={dark ? 'Light mode' : 'Dark mode'} onClick={onTheme}>{dark ? <Sun size={17}/> : <Moon size={17}/>}<span>{dark ? 'Light mode' : 'Dark mode'}</span></button>
          <button className="lp-button" onClick={() => onModal('account')}>{user ? 'Account' : 'Sign in'}</button>
        </div>
      </div>
    </header>

    <main className="lp-wrap workspace-main">
      {page === 'Projects' ? <Projects projects={projects} onOpen={onOpen} onCreate={() => onModal('create')} avatar={avatar} color={color} onBuddy={() => onModal('avatar')}/> :
        <>
          <h1>{workspacePages[page]}</h1>
          {page === 'My students' ? <ClassroomPanel onOpen={onOpen} onSignIn={() => onModal('account')}/> : <StudioNotebook/>}
        </>}
    </main>

    <footer className="lp-footer">
      <button className="lp-logo" onClick={onHome}>ClassCode</button>
      <nav aria-label="Product and policy links">
        <Link href="/safety">Safety</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/about">About and contact</Link>
      </nav>
    </footer>
  </div>;
}

function Projects({projects, onOpen, onCreate, avatar, color, onBuddy}: Pick<Props, 'projects' | 'onOpen' | 'avatar' | 'color'> & {
  onCreate: () => void;
  onBuddy: () => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All projects');
  const [sort, setSort] = useState('recent');
  const search = useDeferredValue(query.trim().toLowerCase());
  const displayed = projects
    .filter(project => project.name.toLowerCase().includes(search) && (
      category === 'All projects' || category === languages[project.type] || category === projectLanguage(project)
    ))
    .toSorted((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : Date.parse(b.updated) - Date.parse(a.updated));

  return <>
    <div className="workspace-title">
      <h1>My projects</h1>
      <button className="lp-button lp-primary" onClick={onCreate}><Plus size={18}/>Start a project</button>
    </div>
    <div className="workspace-layout">
      <section aria-label="Saved projects">
        {projects.length > 0 && <div className="workspace-filters">
          <label className="workspace-search"><Search size={17} aria-hidden="true"/><input type="search" aria-label="Search projects" placeholder="Search projects" value={query} onChange={event => setQuery(event.target.value)}/></label>
          <select aria-label="Project language" value={category} onChange={event => setCategory(event.target.value)}>
            {categories.map(item => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Sort projects" value={sort} onChange={event => setSort(event.target.value)}>
            <option value="recent">Recent first</option><option value="name">A to Z</option>
          </select>
        </div>}
        {displayed.length > 0 ? <ul className="workspace-projects">
          {displayed.map(project => <li key={project.id}>
            <button className="workspace-project" onClick={() => onOpen(project)}>
              <span className="workspace-project-icon">{project.type === 'web' ? <Globe size={20}/> : <Code2 size={20}/>}</span>
              <span><strong>{project.name}</strong><small>{projectLanguage(project)}</small></span>
              <ArrowRight size={17}/>
            </button>
          </li>)}
        </ul> : <div className="workspace-empty">
          <FolderCode size={28} aria-hidden="true"/>
          <h2>{projects.length ? 'No matching projects' : 'No projects yet'}</h2>
          <p>{projects.length ? 'Try another name or language.' : 'Projects you create will show up here.'}</p>
          {projects.length > 0 && <button className="lp-button" onClick={() => {setQuery('');setCategory('All projects')}}>Clear filters</button>}
        </div>}
      </section>
      <section className="workspace-buddy" aria-labelledby="workspace-buddy-title">
        <h2 id="workspace-buddy-title">Coding buddy</h2>
        <Avatar kind={avatar} color={color} size={100}/>
        <strong>{buddyNames[avatar] ?? 'Your avatar'}</strong>
        <button className="lp-button" onClick={onBuddy}>Customize avatar</button>
      </section>
    </div>
  </>;
}

function StudioNotebook() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Saved in this browser');
  useEffect(() => {
    try { setValue(localStorage.getItem('classcode-notes') || ''); }
    catch { setStatus('Notes are unavailable in this browser.'); }
  }, []);
  return <section className="studio-notebook">
    <div><BookOpen size={21}/><strong>Your teaching notebook</strong><span role="status">{status}</span></div>
    <textarea aria-label="Lesson notes" placeholder="Capture a lesson idea, a tricky question, or a small win worth remembering." value={value} onChange={event => {
      const notes = event.target.value;
      setValue(notes);
      try {
        localStorage.setItem('classcode-notes', notes);
        setStatus('Saved in this browser');
      } catch {
        setStatus('Could not save. Copy your notes before leaving.');
      }
    }}/>
  </section>;
}
