import fs from 'node:fs';
import path from 'node:path';
import { url } from './url';

export type ImageEntry = {
  real: string;
  mockSize: string;
  alt?: string;
};

/**
 * Resolve uma entrada de imagem para a URL final.
 * - Se o arquivo existir em `public/<real>`, retorna a URL pública (com base path).
 * - Caso contrário, retorna um placeholder de `placehold.co` no tamanho definido por `mockSize`.
 *
 * Chamado no build (Astro `---` frontmatter). O resultado é uma string pronta para
 * entrar em `<img src>` ou ser passada como prop para componentes React.
 */
export function resolveImage(entry: ImageEntry): string {
  const relative = entry.real.replace(/^\/+/, '');
  const diskPath = path.join(process.cwd(), 'public', relative);
  if (fs.existsSync(diskPath)) {
    return url(entry.real);
  }
  return `https://placehold.co/${entry.mockSize}`;
}
