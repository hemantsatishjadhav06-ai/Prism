/**
 * Shader modules are loaded as raw strings by the `asset/source` webpack
 * rule in next.config.js, so the GLSL can live in real .vert/.frag files
 * per §5.1's directory layout.
 */
declare module '*.vert' {
  const source: string;
  export default source;
}

declare module '*.frag' {
  const source: string;
  export default source;
}

declare module '*.glsl' {
  const source: string;
  export default source;
}
