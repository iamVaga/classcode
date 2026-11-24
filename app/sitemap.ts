import type {MetadataRoute} from 'next';

export default function sitemap():MetadataRoute.Sitemap{
 return [
  {url:'https://classcode-sand.vercel.app/',changeFrequency:'monthly',priority:1},
  {url:'https://classcode-sand.vercel.app/learn',changeFrequency:'monthly',priority:.8},
  {url:'https://classcode-sand.vercel.app/learn/arena',changeFrequency:'monthly',priority:.8},
 ];
}
