import type { ImgHTMLAttributes, ReactElement } from 'react'

export type ImageProps = {
  alt: string
  src: string
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'>

/**
 * Image wrapper that requires descriptive alt text (TypeScript-enforced).
 */
function Image({ alt, src, loading = 'lazy', ...rest }: ImageProps): ReactElement {
  return <img alt={alt} src={src} loading={loading} {...rest} />
}

export default Image
