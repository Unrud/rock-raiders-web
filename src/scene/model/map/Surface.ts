import { Color, Face3, Geometry, Mesh, MeshPhongMaterial, Vector2, Vector3 } from 'three';
import { Terrain } from './Terrain';
import { SurfaceType } from './SurfaceType';
import { ResourceManager } from '../../../resource/ResourceManager';
import { Selectable, SelectionType } from '../../../game/model/Selectable';
import { EventBus } from '../../../event/EventBus';
import { SurfaceSelectedEvent } from '../../../event/LocalEvents';
import { JobType, SurfaceJob, SurfaceJobType } from '../../../game/model/job/Job';
import { JobCreateEvent } from '../../../event/WorldEvents';
import { getRandom, getRandomSign } from '../../../core/Util';
import { Crystal } from '../Crystal';
import { Ore } from '../Ore';
import { HEIGHT_MULTIPLER, TILESIZE } from '../../../main';

export class Surface implements Selectable {

    terrain: Terrain;
    surfaceType: SurfaceType;
    x: number;
    y: number;
    containedOre: number = 0;
    containedCrystals: number = 0;
    heightOffset: number = null;
    discovered: boolean = false;
    selected: boolean = false;
    jobs: SurfaceJob[] = [];

    wallType: WALL_TYPE = null;
    geometry: Geometry = null;
    mesh: Mesh = null;
    needsMeshUpdate: boolean = false;

    // TODO lavaLevel and rubbleLevel for GROUND

    constructor(terrain: Terrain, surfaceType: SurfaceType, x: number, y: number, heightOffset: number) {
        this.terrain = terrain;
        this.surfaceType = surfaceType;
        this.x = x;
        this.y = y;
        this.heightOffset = heightOffset;
        EventBus.registerEventListener(JobCreateEvent.eventKey, (event: JobCreateEvent) => {
            const jobType = event.job.type;
            if (jobType === JobType.SURFACE) {
                const surfaceJob = event.job as SurfaceJob;
                if (surfaceJob.surface === this && !this.hasJobType(surfaceJob.workType)) this.jobs.push(surfaceJob);
            }
        });
    }

    hasJobType(type: SurfaceJobType) {
        return this.jobs.filter((job) => job.workType === type).length > 0;
    }

    /**
     * @return {boolean} Returns true, if a new cave was discovered
     */
    discoverNeighbors(): boolean {
        this.discovered = true; // TODO make all entities on this surface visible
        this.needsMeshUpdate = true;
        let foundCave = false;
        if (this.surfaceType.floor) {
            for (let x = this.x - 1; x <= this.x + 1; x++) {
                for (let y = this.y - 1; y <= this.y + 1; y++) {
                    if (x !== this.x || y !== this.y) {
                        const surf = this.terrain.getSurfaceOrNull(x, y);
                        if (surf && !surf.discovered) {
                            foundCave = surf.discoverNeighbors() || surf.surfaceType.floor;
                            surf.needsMeshUpdate = true;
                        }
                    }
                }
            }
        }
        return foundCave;
    }

    collapse() {
        this.cancelJobs();
        this.surfaceType = SurfaceType.RUBBLE4;
        this.needsMeshUpdate = true;
        // discover surface and all neighbors
        const foundCave = this.discoverNeighbors();
        if (foundCave) console.log('A new cave was discovered'); // TODO emit new-cave event instead
        // check for unsupported neighbors
        for (let x = this.x - 1; x <= this.x + 1; x++) {
            for (let y = this.y - 1; y <= this.y + 1; y++) {
                if (x !== this.x || y !== this.y) {
                    const surf = this.terrain.getSurface(x, y);
                    surf.needsMeshUpdate = true;
                    if (!surf.surfaceType.floor && !surf.isSupported()) {
                        surf.collapse();
                    }
                }
            }
        }
        // update meshes
        this.terrain.surfaces.forEach((c) => c.forEach((surf) => surf.updateMesh(false)));
        this.terrain.floorGroup.updateWorldMatrix(true, true);
        // drop contained crystals and ores
        for (let c = 0; c < this.containedCrystals; c++) {
            const x = this.x * TILESIZE + TILESIZE / 2 + getRandomSign() * getRandom(TILESIZE / 4);
            const z = this.y * TILESIZE + TILESIZE / 2 + getRandomSign() * getRandom(TILESIZE / 4);
            this.terrain.worldMgr.addCollectable(new Crystal(), x, z);
        }
        this.dropContainedOre();
        // hide ore in the rubble
        this.containedOre = 1;
    }

    private dropContainedOre() {
        for (let c = 0; c < this.containedOre; c++) {
            const x = this.x * TILESIZE + TILESIZE / 2 + getRandomSign() * getRandom(TILESIZE / 4);
            const z = this.y * TILESIZE + TILESIZE / 2 + getRandomSign() * getRandom(TILESIZE / 4);
            this.terrain.worldMgr.addCollectable(new Ore(), x, z);
        }
    }

    cancelJobs() {
        this.jobs.forEach((job) => job.cancel());
        this.jobs = [];
        this.updateJobColor();
    }

    reduceRubble() {
        if (this.surfaceType === SurfaceType.RUBBLE4) this.surfaceType = SurfaceType.RUBBLE3;
        else if (this.surfaceType === SurfaceType.RUBBLE3) this.surfaceType = SurfaceType.RUBBLE2;
        else if (this.surfaceType === SurfaceType.RUBBLE2) this.surfaceType = SurfaceType.RUBBLE1;
        else if (this.surfaceType === SurfaceType.RUBBLE1) this.surfaceType = SurfaceType.GROUND;
        this.dropContainedOre();
        this.containedOre = this.surfaceType !== SurfaceType.GROUND ? 1 : 0;
        this.updateMesh();
    }

    isSupported(): boolean {
        const floorLeft = Number(this.terrain.getSurface(this.x - 1, this.y).surfaceType.floor);
        const floorTop = Number(this.terrain.getSurface(this.x, this.y - 1).surfaceType.floor);
        const floorRight = Number(this.terrain.getSurface(this.x + 1, this.y).surfaceType.floor);
        const floorBottom = Number(this.terrain.getSurface(this.x, this.y + 1).surfaceType.floor);
        let floorSum = floorLeft + floorTop + floorRight + floorBottom;
        return floorSum <= 2;
    }

    updateMesh(force: boolean = true) {
        if (!force && !this.needsMeshUpdate) return;
        this.needsMeshUpdate = false;

        const topLeftVertex = new Vector3(this.x, 0, this.y);
        const topRightVertex = new Vector3(this.x + 1, 0, this.y);
        const bottomLeftVertex = new Vector3(this.x, 0, this.y + 1);
        const bottomRightVertex = new Vector3(this.x + 1, 0, this.y + 1);

        const surfLeft = this.terrain.getSurface(this.x - 1, this.y);
        const surfTopLeft = this.terrain.getSurface(this.x - 1, this.y - 1);
        const surfTop = this.terrain.getSurface(this.x, this.y - 1);
        const surfTopRight = this.terrain.getSurface(this.x + 1, this.y - 1);
        const surfRight = this.terrain.getSurface(this.x + 1, this.y);
        const surfBottomRight = this.terrain.getSurface(this.x + 1, this.y + 1);
        const surfBottom = this.terrain.getSurface(this.x, this.y + 1);
        const surfBottomLeft = this.terrain.getSurface(this.x - 1, this.y + 1);

        function isHighGround(surf1: Surface, surf2: Surface, surf3: Surface) {
            return !surf1.discovered || !surf2.discovered || !surf3.discovered ||
                (!surf1.surfaceType.floor && !surf2.surfaceType.floor && !surf3.surfaceType.floor);
        }

        if (!this.discovered) {
            topLeftVertex.y = 1;
            topRightVertex.y = 1;
            bottomRightVertex.y = 1;
            bottomLeftVertex.y = 1;
        } else if (!this.surfaceType.floor) {
            if (isHighGround(surfLeft, surfTopLeft, surfTop)) topLeftVertex.y = 1;
            if (isHighGround(surfTop, surfTopRight, surfRight)) topRightVertex.y = 1;
            if (isHighGround(surfRight, surfBottomRight, surfBottom)) bottomRightVertex.y = 1;
            if (isHighGround(surfBottom, surfBottomLeft, surfLeft)) bottomLeftVertex.y = 1;
        }

        // update mesh (geometry), if wall type changed
        const walltype = topLeftVertex.y + topRightVertex.y + bottomRightVertex.y + bottomLeftVertex.y;
        if (this.wallType !== walltype) {
            this.wallType = walltype;
            this.updateGeometry(topLeftVertex, bottomRightVertex, topRightVertex, bottomLeftVertex, surfTopLeft, surfTop, surfLeft, surfTopRight, surfRight, surfBottomRight, surfBottom, surfBottomLeft);
        }

        // update texture
        this.updateTexture(topLeftVertex, bottomRightVertex);

        this.updateJobColor();

        this.terrain.surfaces[this.x][this.y] = this;
    }

    updateTexture(topLeftVertex: Vector3, bottomRightVertex: Vector3) {
        let textureName = this.terrain.textureSet.texturebasename;
        if (!this.discovered) {
            textureName += '70';
        } else if (!this.surfaceType.shaping) {
            textureName += this.surfaceType.matIndex.toString();
        } else if (this.wallType === WALL_TYPE.WALL && (topLeftVertex.y === bottomRightVertex.y)) {
            textureName += '77';
        } else {
            if (this.wallType === WALL_TYPE.CORNER) {
                textureName += '5';
            } else if (this.wallType === WALL_TYPE.INVERTED_CORNER) {
                textureName += '3';
            } else {
                textureName += '0';
            }
            textureName += this.surfaceType.matIndex;
        }
        textureName += '.bmp';

        const texture = ResourceManager.getTexture(textureName);
        texture.flipY = false; // TODO is this necessary? Maybe turn around UV or vertices?

        this.accessMaterials().forEach((mat) => mat.map = texture);
    }

    accessMaterials(): MeshPhongMaterial[] {
        if (!this.mesh || !this.mesh.material) return [];
        if (Array.isArray(this.mesh.material)) {
            return this.mesh.material as MeshPhongMaterial[];
        } else {
            return [this.mesh.material as MeshPhongMaterial];
        }
    }

    updateGeometry(topLeftVertex: Vector3, bottomRightVertex: Vector3, topRightVertex: Vector3, bottomLeftVertex: Vector3, surfTopLeft: Surface, surfTop: Surface, surfLeft: Surface, surfTopRight: Surface, surfRight: Surface, surfBottomRight: Surface, surfBottom: Surface, surfBottomLeft: Surface) {
        let uvOffset = 0;

        // not-rotated
        // 1 ?
        // ? 0
        if (topLeftVertex.y && !bottomRightVertex.y &&
            (this.wallType === WALL_TYPE.INVERTED_CORNER || ((this.wallType === WALL_TYPE.WALL) === Boolean(topRightVertex.y)))) {
            uvOffset = 0;
        }

        // 90 clock-wise
        // ? 1
        // 0 ?
        if (topRightVertex.y && !bottomLeftVertex.y &&
            (this.wallType === WALL_TYPE.INVERTED_CORNER || ((this.wallType === WALL_TYPE.WALL) === Boolean(bottomRightVertex.y)))) {
            uvOffset = 3;
        }

        // 180 clock-wise
        // 0 ?
        // ? 1
        if (bottomRightVertex.y && !topLeftVertex.y &&
            (this.wallType === WALL_TYPE.INVERTED_CORNER || ((this.wallType === WALL_TYPE.WALL) === Boolean(bottomLeftVertex.y)))) {
            uvOffset = 2;
        }

        // 270 clock-wise
        // ? 0
        // 1 ?
        if (bottomLeftVertex.y && !topRightVertex.y &&
            (this.wallType === WALL_TYPE.INVERTED_CORNER || ((this.wallType === WALL_TYPE.WALL) === Boolean(topLeftVertex.y)))) {
            uvOffset = 1;
        }

        if (this.wallType === WALL_TYPE.WALL) {
            if (topLeftVertex.y && bottomRightVertex.y) {
                uvOffset = 0;
            }
            if (topRightVertex.y && bottomLeftVertex.y) {
                uvOffset = 3;
            }
        }

        /*
        //		0---1                1         0---1
        //		|   |  becomes      /|   and   |  /
        //		|   |             /  |         |/
        //		3---2            3---2         3
        //
        //		OR
        //
        //		0---1            0             0---1
        //		|   |  becomes   |\    	 and    \  |
        //		|   |            |  \             \|
        //		3---2            3---2             2
        //
        //		Triangles 0-1-3 and 0-3-2
        //		Quad 0-1-3-2
        */

        if (this.mesh) this.terrain.floorGroup.remove(this.mesh);
        if (this.geometry) this.geometry.dispose();
        this.geometry = new Geometry();

        this.geometry.vertices.push(
            topLeftVertex,
            topRightVertex,
            bottomRightVertex,
            bottomLeftVertex,
        );

        const uv = [
            new Vector2(0, 0),
            new Vector2(1, 0),
            new Vector2(1, 1),
            new Vector2(0, 1),
        ];

        if (topRightVertex.y !== bottomLeftVertex.y ||
            (this.wallType === WALL_TYPE.WALL && !(topRightVertex.y && bottomLeftVertex.y))) {
            this.geometry.faceVertexUvs[0].push([
                uv[(1 + uvOffset) % 4],
                uv[(3 + uvOffset) % 4],
                uv[(2 + uvOffset) % 4],
            ]);

            // noinspection PointlessArithmeticExpressionJS
            this.geometry.faceVertexUvs[0].push([
                uv[(1 + uvOffset) % 4],
                uv[(0 + uvOffset) % 4],
                uv[(3 + uvOffset) % 4],
            ]);

            this.geometry.faces.push(
                new Face3(1, 3, 2),
                new Face3(1, 0, 3),
            );
        } else {
            // noinspection PointlessArithmeticExpressionJS
            this.geometry.faceVertexUvs[0].push([
                uv[(0 + uvOffset) % 4],
                uv[(3 + uvOffset) % 4],
                uv[(2 + uvOffset) % 4],
            ]);

            // noinspection PointlessArithmeticExpressionJS
            this.geometry.faceVertexUvs[0].push([
                uv[(0 + uvOffset) % 4],
                uv[(2 + uvOffset) % 4],
                uv[(1 + uvOffset) % 4],
            ]);

            this.geometry.faces.push(
                new Face3(0, 3, 2),
                new Face3(0, 2, 1),
            );
        }

        function avgHeight(...args: Surface[]) {
            let sum = 0, cnt = 0;
            args.map(s => s.heightOffset).filter(Boolean).forEach(h => {
                sum += h;
                cnt++;
            });
            return sum / cnt;
        }

        // apply height modification
        topLeftVertex.y += avgHeight(surfTopLeft, surfTop, this, surfLeft) * HEIGHT_MULTIPLER;
        topRightVertex.y += avgHeight(surfTop, surfTopRight, surfRight, this) * HEIGHT_MULTIPLER;
        bottomRightVertex.y += avgHeight(this, surfRight, surfBottomRight, surfBottom) * HEIGHT_MULTIPLER;
        bottomLeftVertex.y += avgHeight(surfLeft, this, surfBottom, surfBottomLeft) * HEIGHT_MULTIPLER;

        this.geometry.computeFaceNormals();
        this.geometry.computeVertexNormals();

        this.mesh = new Mesh(this.geometry, new MeshPhongMaterial({shininess: 0}));
        this.mesh.userData = {selectable: this};

        this.terrain.floorGroup.add(this.mesh);
        this.terrain.floorGroup.updateWorldMatrix(true, true); // otherwise ray intersection is not working before rendering
    }

    getSelectionType(): SelectionType {
        return SelectionType.SURFACE;
    }

    select(): Selectable {
        if (this.surfaceType.selectable) {
            if (!this.selected) {
                this.selected = true;
                this.accessMaterials().forEach((mat) => mat.color.setHex(0xa0a0a0));
                EventBus.publishEvent(new SurfaceSelectedEvent(this));
            }
            return this;
        }
        return null;
    }

    deselect(): any {
        if (this.selected) {
            this.selected = false;
            this.updateJobColor();
        }
    }

    updateJobColor() {
        let color = 0xffffff;
        this.jobs.forEach((job) => color = job.workType.color); // TODO prioritize colors?
        this.accessMaterials().forEach((mat) => mat.color = new Color(color));
    }

    hasRubble(): boolean { // TODO performance: use boolean on surfacetype
        return this.surfaceType === SurfaceType.RUBBLE1
            || this.surfaceType === SurfaceType.RUBBLE2
            || this.surfaceType === SurfaceType.RUBBLE3
            || this.surfaceType === SurfaceType.RUBBLE4;
    }

    isPath(): boolean { // TODO performance: use boolean on surfacetype
        return this.surfaceType === SurfaceType.POWER_PATH_ALL
            || this.surfaceType === SurfaceType.POWER_PATH_SITE
            || this.surfaceType === SurfaceType.POWER_PATH_STRAIGHT
            || this.surfaceType === SurfaceType.POWER_PATH_CORNER
            || this.surfaceType === SurfaceType.POWER_PATH_TCROSSING
            || this.surfaceType === SurfaceType.POWER_PATH_END
            || this.surfaceType === SurfaceType.POWER_PATH_BUILDING;
    }

}

export enum WALL_TYPE {

    CORNER = 1,
    WALL = 2, // or WEIRD_CREVICE
    INVERTED_CORNER = 3,

}
