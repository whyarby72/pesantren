import type { IconName } from '../lib/modules';
import type { ReactNode } from 'react';
const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
  book: <><path d="M12 7a6 6 0 0 0-8-2v14a6 6 0 0 1 8 2V7Zm0 0a6 6 0 0 1 8-2v14a6 6 0 0 0-8 2V7Z"/></>,
  spark: <><path d="m12 3 1.8 5.3L19 10l-5.2 1.7L12 17l-1.8-5.3L5 10l5.2-1.7L12 3Z"/><path d="M19 17v4m-2-2h4M4 17v3m-1-1h3"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5v1"/></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-6 6h3"/></>,
  shield: <><path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4Z"/><path d="m9 12 2 2 4-4"/></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
  activity: <><path d="M3 12h4l3-7 4 14 3-7h4"/></>,
  arrow: <><path d="M5 12h14m-7-7 7 7-7 7"/></>,
  lock: <><rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 10v6m0-10v.2"/></>,
  chevron: <><path d="m9 18 6-6-6-6"/></>
};
export function Icon({name,size=20,className=''}:{name:IconName;size?:number;className?:string}) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
