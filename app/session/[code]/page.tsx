import GuestSession from '@/components/guest-session';
export default async function SessionPage({params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 return <GuestSession code={code}/>;
}
