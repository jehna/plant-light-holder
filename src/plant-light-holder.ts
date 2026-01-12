import {
  draw,
  Wire,
  Solid,
  drawCircle,
  loft,
  Sketches,
  Compound,
} from "replicad";

const wallMountThickness = 8;
const wallMountRadius = 45;
const rodRadius = 12;
const rodLength = 150;
const tipRadius = 14;
const transitionHeight = 10;
const transitionThickness = 8;
const hookHeight = 16;
const uCurveHeight = 10;
const hookThickness = 6.5;
const holeRadius = 2.6;

function uSketchAtZ(z: number, halfWidth: number) {
  const depth = halfWidth;
  return draw([-halfWidth, 0])
    .vLine(depth)
    .hBulgeArc(halfWidth * 2, -1)
    .vLine(-depth)
    .close()
    .sketchOnPlane("XY", z) as Sketches;
}

export const main = () => {
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
    .sketchOnPlane("YZ", [hookThickness / 2, tipRadius])
    .extrude(-hookThickness) as Solid;

  const uProfile = (
    draw([0, transitionEnd])
      .vLine(uCurveHeight)
      .hBulgeArc(tipRadius * 2, -1)
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
