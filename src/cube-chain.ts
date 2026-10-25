// Small quantities only: the lesson explorer allows at most six of each color.
// The olympiad solution computes the length directly instead of constructing it.
export function buildCubeChain(counts: number[]): number[] {
  const remaining = [...counts];
  const chain: number[] = [];
  while (true) {
    let next = -1;
    for (let color = 0; color < remaining.length; color++) {
      if (
        color !== chain.at(-1) &&
        remaining[color] > 0 &&
        (next === -1 || remaining[color] > remaining[next])
      ) {
        next = color;
      }
    }
    if (next === -1) return chain;
    chain.push(next);
    remaining[next]--;
  }
}
