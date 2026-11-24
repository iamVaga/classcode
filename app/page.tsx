import Classroom from '@/components/classroom';
import {Geist} from 'next/font/google';

const body = Geist({subsets:['latin'], display:'swap', variable:'--font-landing-body', preload:true});

export default async function Page({searchParams}: {searchParams: Promise<{workspace?: string | string[]}>}) {
 const {workspace} = await searchParams;
 return <Classroom landingFont={body.variable} startInWorkspace={workspace === '1'}/>;
}
