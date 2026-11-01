import {AbsoluteFill, Composition, useCurrentFrame} from 'remotion';
import {NeoArtwork, TimothyNeoClip} from '../brands/lauza/timothy-reference/NeoClip';
import {FontStyles} from './shared/FontStyles';
const StylePreview=()=>{
 const frame=useCurrentFrame();
 return <AbsoluteFill><FontStyles/><NeoArtwork frame={405+frame}/></AbsoluteFill>;
};
export const RemotionRoot=()=> <>
 <Composition id="LauzaStylePreview" component={StylePreview} width={1080} height={1920} fps={30} durationInFrames={150}/>
 <Composition id="LauzaTimothyReference" component={TimothyNeoClip} width={1080} height={1920} fps={30} durationInFrames={1560}/>
</>;
