import './globals.css';
import './studio.css';
import './editor.css';
import './motion.css';
import './classroom.css';
import './assignments.css';
import './snippets.css';
import AvatarPointer from '@/components/avatar-pointer';
import ConnectionProvider from '@/components/connection-provider';
export const metadata = {title:'ClassCode — Your classroom, connected.',description:'A thoughtful coding workspace for teachers and curious minds.',icons:{icon:'/classcode-mark.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><ConnectionProvider>{children}<AvatarPointer/></ConnectionProvider></body></html>}
