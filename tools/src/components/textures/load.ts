import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { RepeatWrapping, SRGBColorSpace, sRGBEncoding, Texture } from 'three';
import { textureUrl } from './url';

export type LoadedTextureSet = { map?: Texture; normalMap?: Texture; roughnessMap?: Texture };

export function useLoadTextureSet(urls: { albedo?: string; normal?: string; roughness?: string }): LoadedTextureSet {
  const { gl } = useThree();
  const maxAniso = (gl?.capabilities as any)?.getMaxAnisotropy?.() ?? 8;
  const anisotropy = Math.min(16, Math.max(4, maxAniso || 8));

  const paths: Record<string, string> = {};
  if (urls.albedo) paths.map = textureUrl(urls.albedo);
  if (urls.normal) paths.normalMap = textureUrl(urls.normal);
  if (urls.roughness) paths.roughnessMap = textureUrl(urls.roughness);

  // Drei supports object form mapping
  const loaded = useTexture(paths as any) as any;

  const setCommon = (t?: Texture, isAlbedo = false) => {
    if (!t) return t;
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.anisotropy = anisotropy;
    // color space for color textures
    if (isAlbedo) {
      try {
        (t as any).colorSpace = SRGBColorSpace;
      } catch {
        (t as any).encoding = sRGBEncoding;
      }
    }
    return t;
  };

  return {
    map: setCommon(loaded.map, true),
    normalMap: setCommon(loaded.normalMap),
    roughnessMap: setCommon(loaded.roughnessMap),
  };
}

