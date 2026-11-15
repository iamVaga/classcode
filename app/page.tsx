import Classroom from '@/components/classroom';
import {Geist} from 'next/font/google';

const body = Geist({subsets:['latin'], display:'swap', variable:'--font-landing-body', preload:true});

export default function Page() {
 return <Classroom landingFont={body.variable}/>;
}
