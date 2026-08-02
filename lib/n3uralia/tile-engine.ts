export interface TileEngineOptions {
  tileSize: number;
  overlap: number;
}

export interface ImageTile {
  index: number;
  row: number;
  column: number;
  left: number;
  top: number;
  width: number;
  height: number;
  coreLeft: number;
  coreTop: number;
  coreWidth: number;
  coreHeight: number;
  cropLeft: number;
  cropTop: number;
}

export interface TilePlan {
  imageWidth: number;
  imageHeight: number;
  tileSize: number;
  overlap: number;
  rows: number;
  columns: number;
  tiles: ImageTile[];
}

const DEFAULT_TILE_SIZE = 1024;
const DEFAULT_OVERLAP = 64;

export function createTilePlan(
  imageWidth: number,
  imageHeight: number,
  options: Partial<TileEngineOptions> = {},
): TilePlan {
  if (!Number.isInteger(imageWidth) || imageWidth <= 0) {
    throw new Error('Image width must be a positive integer');
  }
  if (!Number.isInteger(imageHeight) || imageHeight <= 0) {
    throw new Error('Image height must be a positive integer');
  }

  const tileSize = options.tileSize ?? DEFAULT_TILE_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;

  if (!Number.isInteger(tileSize) || tileSize < 128) {
    throw new Error('Tile size must be an integer of at least 128 pixels');
  }
  if (!Number.isInteger(overlap) || overlap < 0 || overlap * 2 >= tileSize) {
    throw new Error('Tile overlap must be non-negative and less than half the tile size');
  }

  const coreSize = tileSize - overlap * 2;
  const columns = Math.max(1, Math.ceil(imageWidth / coreSize));
  const rows = Math.max(1, Math.ceil(imageHeight / coreSize));
  const tiles: ImageTile[] = [];

  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    const coreTop = row * coreSize;
    const coreHeight = Math.min(coreSize, imageHeight - coreTop);

    for (let column = 0; column < columns; column += 1) {
      const coreLeft = column * coreSize;
      const coreWidth = Math.min(coreSize, imageWidth - coreLeft);
      const left = Math.max(0, coreLeft - overlap);
      const top = Math.max(0, coreTop - overlap);
      const right = Math.min(imageWidth, coreLeft + coreWidth + overlap);
      const bottom = Math.min(imageHeight, coreTop + coreHeight + overlap);

      tiles.push({
        index,
        row,
        column,
        left,
        top,
        width: right - left,
        height: bottom - top,
        coreLeft,
        coreTop,
        coreWidth,
        coreHeight,
        cropLeft: coreLeft - left,
        cropTop: coreTop - top,
      });
      index += 1;
    }
  }

  return {
    imageWidth,
    imageHeight,
    tileSize,
    overlap,
    rows,
    columns,
    tiles,
  };
}

export function recommendTileOptions(
  imageWidth: number,
  imageHeight: number,
  availableMemoryMb = 1024,
): TileEngineOptions {
  const megapixels = (imageWidth * imageHeight) / 1_000_000;
  const memoryLimitedTile = availableMemoryMb < 512 ? 512 : availableMemoryMb < 1024 ? 768 : 1024;
  const tileSize = megapixels > 100 ? Math.min(memoryLimitedTile, 768) : memoryLimitedTile;

  return {
    tileSize,
    overlap: Math.max(32, Math.round(tileSize / 16)),
  };
}

export function shouldUseTiles(
  imageWidth: number,
  imageHeight: number,
  pixelThreshold = 40_000_000,
): boolean {
  return imageWidth * imageHeight > pixelThreshold;
}
