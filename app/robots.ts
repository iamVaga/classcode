import type {MetadataRoute} from 'next';

export default function robots():MetadataRoute.Robots{
 return {rules:{userAgent:'*',allow:'/'},sitemap:'https://classcode-sand.vercel.app/sitemap.xml'};
}
