export function lttbIndices(data: number[], threshold: number): number[] {
  const len = data.length;
  if (threshold >= len || threshold < 2) return data.map((_, i) => i);

  const bucketSize = (len - 2) / (threshold - 2);
  const indices: number[] = [0];
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgEnd = Math.floor((i + 2) * bucketSize) + 1;

    let avgX = 0, avgY = 0, avgCount = 0;
    for (let j = avgStart; j < avgEnd && j < len; j++) {
      avgX += j;
      avgY += data[j];
      avgCount++;
    }
    if (avgCount > 0) { avgX /= avgCount; avgY /= avgCount; }

    const bucketStart = Math.floor(i * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;
    let maxArea = -1;
    let maxIdx = bucketStart;

    for (let j = Math.floor(bucketStart); j < Math.floor(bucketEnd) && j < len - 1; j++) {
      const area = Math.abs(
        (a - avgX) * (data[j] - avgY) -
        (j - avgX) * (data[a] - avgY)
      );
      if (area > maxArea) { maxArea = area; maxIdx = j; }
    }

    indices.push(maxIdx);
    a = maxIdx;
  }

  indices.push(len - 1);
  return indices;
}
