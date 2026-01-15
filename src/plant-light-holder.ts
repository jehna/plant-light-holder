import {
  draw,
  Wire,
  Solid,
  drawCircle,
  loft,
  Sketches,
  Compound,
} from "replicad";

export interface ModelParams {
  neckLength: number;
  neckThickness: number;
  baseWidth: number;
}

export const defaultParams: ModelParams = {
  neckLength: 170,
  neckThickness: 6.5,
  baseWidth: 45,
};

const wallMountThickness = 8;
const rodRadius = 12;
const tipRadius = 14;
const transitionHeight = 10;
const transitionThickness = 8;
const hookHeight = 16;
const uCurveHeight = 10;
const holeRadius = 2.6;

function uSketchAtZ(z: number, width: number) {
  const halfWidth = width / 2;
  return draw([-width, 0])
    .vLine(halfWidth)
    .hBulgeArc(width, -1)
    .vLine(-halfWidth)
    .close()
    .translate([halfWidth, 0])
    .sketchOnPlane("XY", z) as Sketches;
}

export const main = (params: ModelParams = defaultParams) => {
  const {
    neckLength: rodLength,
    neckThickness: hookThickness,
    baseWidth: wallMountRadius,
  } = params;

  const wallMount = uSketchAtZ(0, wallMountRadius).extrude(
    wallMountThickness
  ) as Solid;

  const rodTopZ = wallMountThickness + rodLength;
  const transitionTopPos = rodTopZ + transitionHeight;
  const transitionEnd = transitionTopPos + transitionThickness;

  const rod = loft([
    uSketchAtZ(wallMountThickness, rodRadius).wires() as Wire,
    uSketchAtZ(rodTopZ, rodRadius).wires() as Wire,
    uSketchAtZ(transitionTopPos, tipRadius).wires() as Wire,
    uSketchAtZ(transitionEnd, tipRadius).wires() as Wire,
  ]) as Solid;

  const holeCenterZ = transitionEnd + uCurveHeight;

  const keepVolume = uSketchAtZ(transitionEnd, tipRadius).extrude(
    hookHeight + uCurveHeight
  ) as Solid;

  const hole = drawCircle(holeRadius)
    .sketchOnPlane("YZ", [hookThickness / 2, tipRadius / 2])
    .extrude(-hookThickness) as Solid;

  const uProfile = (
    draw([0, transitionEnd])
      .vLine(uCurveHeight)
      .hBulgeArc(tipRadius, -1)
      .vLine(-uCurveHeight)
      .close()
      .sketchOnPlane("YZ")
      .extrude(hookThickness)
      .translate([-hookThickness / 2, 0, 0]) as Solid
  ).cut(hole.translate([0, 0, holeCenterZ]));

  const fullKeepVolume = wallMount.clone().fuse(rod.clone()).fuse(keepVolume);

  const rounded = wallMount
    .fuse(rod)
    .fuse(uProfile)
    .intersect(fullKeepVolume) as Compound;

  return rounded
    .fillet(5, (e) =>
      e
        .inPlane("XY", wallMountThickness)
        .withinDistance(wallMountRadius * 2, [0, 0, 0])
        .inDirection("Y")
    )
    .fillet(4, (e) =>
      e
        .inPlane("XZ", 0)
        .inBox([-wallMountRadius, 0, 0], [wallMountRadius, 1, transitionTopPos])
    );
};
