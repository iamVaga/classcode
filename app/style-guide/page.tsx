import type {Metadata} from 'next';
import StyleGuide from '@/components/style-guide';

export const metadata:Metadata={title:'Design system',description:'ClassCode design tokens and interactive component states.',robots:{index:false,follow:false},alternates:{canonical:'/style-guide'}};

export default function Page(){return <StyleGuide/>}
