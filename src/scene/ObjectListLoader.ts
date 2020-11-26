import { ResourceManager } from '../resource/ResourceManager';
import { TILESIZE } from '../main';
import { MathUtils, Vector3 } from 'three';
import { Raider } from './model/Raider';
import { GameState } from '../game/model/GameState';
import { Building } from '../game/model/entity/building/Building';
import { BuildingEntity } from './model/BuildingEntity';
import { SurfaceType } from './model/map/SurfaceType';
import { Crystal } from './model/collect/Crystal';
import { WorldManager } from './WorldManager';
import { EventBus } from '../event/EventBus';
import { EntityAddedEvent, EntityType } from '../event/WorldEvents';
import degToRad = MathUtils.degToRad;

export class ObjectListLoader {

    static loadObjectList(worldMgr: WorldManager, objectListConf) {
        Object.values(objectListConf).forEach((olObject: any) => {
            const lTypeName = olObject.type ? olObject.type.toLowerCase() : olObject.type;
            // all object positions are off by half a tile, because 0/0 is the top left corner of first tile
            const worldX = (olObject.xPos - 1) * TILESIZE;
            const worldZ = (olObject.yPos - 1) * TILESIZE;
            const worldY = worldMgr.getTerrainHeight(worldX, worldZ);
            const buildingType = ResourceManager.cfg('BuildingTypes', olObject.type);
            const radHeading = degToRad(olObject.heading);
            if (lTypeName === 'TVCamera'.toLowerCase()) {
                const target = new Vector3(worldX, worldY, worldZ - TILESIZE / 2);
                const offset = new Vector3(5 * TILESIZE, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), radHeading - Math.PI / 16).add(target);
                worldMgr.sceneManager.camera.position.copy(offset);
                worldMgr.sceneManager.camera.position.y = 4.5 * TILESIZE;
                worldMgr.sceneManager.controls.target.copy(target);
                worldMgr.sceneManager.controls.update();
                worldMgr.setTorchPosition(target);
            } else if (lTypeName === 'Pilot'.toLowerCase()) {
                const raider = new Raider();
                raider.worldMgr = worldMgr;
                raider.setActivity('Stand');
                raider.createPickSphere();
                raider.group.position.set(worldX, worldY, worldZ);
                raider.group.rotateOnAxis(new Vector3(0, 1, 0), radHeading - Math.PI / 2);
                raider.group.visible = worldMgr.sceneManager.terrain.getSurfaceFromWorld(raider.group.position).discovered;
                if (raider.group.visible) {
                    GameState.raiders.push(raider);
                    EventBus.publishEvent(new EntityAddedEvent(EntityType.RAIDER, raider));
                } else {
                    GameState.raidersUndiscovered.push(raider);
                }
                worldMgr.sceneManager.scene.add(raider.group);
            } else if (buildingType) {
                const building = Building.getByName(buildingType);
                const entity = new BuildingEntity(building);
                entity.worldMgr = worldMgr;
                entity.setActivity('Stand');
                entity.createPickSphere();
                entity.group.position.set(worldX, worldY, worldZ);
                entity.group.rotateOnAxis(new Vector3(0, 1, 0), -radHeading - Math.PI);
                entity.group.visible = worldMgr.sceneManager.terrain.getSurfaceFromWorld(entity.group.position).discovered;
                if (entity.group.visible) {
                    GameState.buildings.push(entity);
                    EventBus.publishEvent(new EntityAddedEvent(EntityType.BUILDING, entity));
                } else {
                    GameState.buildingsUndiscovered.push(entity);
                }
                // TODO rotate building with normal vector of surface
                worldMgr.sceneManager.scene.add(entity.group);
                const path1Surface = worldMgr.sceneManager.terrain.getSurfaceFromWorld(entity.group.position);
                path1Surface.surfaceType = SurfaceType.POWER_PATH_BUILDING;
                path1Surface.updateTexture();
                entity.surfaces.push(path1Surface);
                const pathOffset = new Vector3(0, 0, TILESIZE).applyAxisAngle(new Vector3(0, 1, 0), -radHeading - Math.PI);
                pathOffset.add(entity.group.position);
                const path2Surface = worldMgr.sceneManager.terrain.getSurfaceFromWorld(pathOffset);
                path2Surface.surfaceType = SurfaceType.POWER_PATH_BUILDING;
                path2Surface.updateTexture();
                entity.surfaces.push(path2Surface);
            } else if (lTypeName === 'PowerCrystal'.toLowerCase()) {
                worldMgr.addCollectable(new Crystal(), worldX, worldZ);
            } else {
                // TODO implement remaining object types like: spider, drives and hovercraft
                console.warn('Object type ' + olObject.type + ' not yet implemented');
            }
        });
        // update path textures when all buildings are added
        GameState.buildings.forEach((b) => b.surfaces.forEach((bSurf) => {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    worldMgr.sceneManager.terrain.getSurface(bSurf.x + x, bSurf.y + y).updateTexture();
                }
            }
        }));
    }

}