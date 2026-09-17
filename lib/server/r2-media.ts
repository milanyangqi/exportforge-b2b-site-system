import {getCloudflareContext} from '@opennextjs/cloudflare';
type MediaBucket={put(key:string,value:ArrayBuffer,options:{httpMetadata:{contentType:string;cacheControl:string}}):Promise<unknown>;delete(key:string):Promise<void>};
export async function getMediaBucket():Promise<MediaBucket|null>{
 if(process.env.EXPORTFORGE_SELF_HOST==='1')return null;
 const ctx=await getCloudflareContext({async:true});const env=ctx.env as unknown as {YUVA_MEDIA?:MediaBucket};
 if(!env.YUVA_MEDIA)throw new Error('Product media storage is not configured');
 return env.YUVA_MEDIA;
}
export function mediaPublicUrl(key:string){return `https://media.yuvacosmetics.com/${key}`;}
