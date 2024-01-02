import { Surface } from '../../game/terrain/Surface'

export class MapSurfaceRect {
    x: number
    y: number
    surfaceColor: string
    borderColor: string
    name: string

    constructor(surface: Surface) {
        this.x = surface.x
        this.y = surface.y
        this.surfaceColor = surface.surfaceType.mapSurfaceColor
        this.borderColor = surface.reinforced ? '#FFFF00' : null
        this.name = surface.surfaceType.name
    }
}
