import { PositionalAudio } from 'three'
import { SaveGameManager } from '../resource/SaveGameManager'
import { SoundManager } from '../audio/SoundManager'
import { SceneMesh } from './SceneMesh'
import { TILESIZE } from '../params'

export class SceneAudioMesh extends SceneMesh {
    audioNode: PositionalAudio
    lastSfxName: string

    update(elapsedMs: number) {
        const sfxVolume = SaveGameManager.getSfxVolume()
        if (sfxVolume <= 0) return
        const sfxName = this.userData.sfxNameAnimation
        if (this.lastSfxName === sfxName || !sfxName) return
        this.lastSfxName = sfxName
        const audioBuffer = SoundManager.getSoundBuffer(sfxName)
        if (!audioBuffer) return
        if (!this.audioNode) {
            this.audioNode = new PositionalAudio(SoundManager.sceneAudioListener)
            this.audioNode.setRefDistance(TILESIZE * 5)
            this.audioNode.setRolloffFactor(10)
            this.add(this.audioNode)
        }
        this.audioNode.setVolume(sfxVolume)
        this.audioNode.onEnded = () => {
            SoundManager.stopAudio(this.audioNode)
            this.lastSfxName = null
        }
        this.audioNode.setBuffer(audioBuffer)
        this.audioNode.play()
        SoundManager.playingAudio.add(this.audioNode)
    }

    dispose() {
        SoundManager.stopAudio(this.audioNode)
        this.lastSfxName = null
    }
}
